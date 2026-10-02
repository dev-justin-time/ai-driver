package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"runtime/debug"
	"sync"
	"sync/atomic"
	"time"

	"github.com/gorilla/websocket"
)

/*
 @tweakable target GPS pings per second simulated (integer)
*/
var TARGET_GPS_PPS = 1000

/*
 @tweakable target orders per minute simulated (integer)
*/
var TARGET_ORDERS_PER_MIN = 100

/*
 @tweakable size of internal ingestion buffers (per channel)
*/
var INGEST_BUFFER = 16384

// Disable GC to avoid GC pauses for this simulation. Be cautious: disabling GC
// means memory will grow unbounded unless you reuse buffers; we use sync.Pool.
func init() {
	// Completely disable GC
	debug.SetGCPercent(-1)
}

type GPSPing struct {
	VehicleID string  `json:"vehicle_id"`
	Lat       float64 `json:"lat"`
	Lng       float64 `json:"lng"`
	SpeedKph  float64 `json:"speed_kph"`
	Timestamp int64   `json:"timestamp"`
}

type DeliveryOrder struct {
	OrderID   string `json:"order_id"`
	PickupLat float64 `json:"pickup_lat"`
	PickupLng float64 `json:"pickup_lng"`
	DropLat   float64 `json:"drop_lat"`
	DropLng   float64 `json:"drop_lng"`
	CreatedAt int64  `json:"created_at"`
}

var (
	// Pools to reuse objects, minimizing allocations and GC pressure
	gpsPool   = sync.Pool{New: func() any { return &GPSPing{} }}
	orderPool = sync.Pool{New: func() any { return &DeliveryOrder{} }}

	// Ingest channels (buffered)
	gpsIngestCh   = make(chan *GPSPing, INGEST_BUFFER)
	orderIngestCh = make(chan *DeliveryOrder, INGEST_BUFFER)

	// Simple counters for monitoring
	receivedGPS   uint64
	processedGPS  uint64
	receivedOrder uint64
	processedOrder uint64
)

// simple processor that batches events and "processes" them (here we just marshal)
func startGPSProcessor(ctx context.Context, workers int) {
	for i := 0; i < workers; i++ {
		go func(id int) {
			batch := make([]*GPSPing, 0, 512) // stack-allocated once
			ticker := time.NewTicker(200 * time.Millisecond)
			defer ticker.Stop()
			for {
				select {
				case <-ctx.Done():
					return
				case p := <-gpsIngestCh:
					batch = append(batch, p)
					// drain quickly up to a cap to reduce allocations
				DrainLoop:
					for len(batch) < 512 {
						select {
						case p2 := <-gpsIngestCh:
							batch = append(batch, p2)
						default:
							break DrainLoop
						}
					}
					// process batch
					processGPSBatch(batch)
					// return items to pool
					for _, item := range batch {
						atomic.AddUint64(&processedGPS, 1)
						// zero fields for reuse
						item.VehicleID = ""
						item.Lat = 0
						item.Lng = 0
						item.SpeedKph = 0
						item.Timestamp = 0
						gpsPool.Put(item)
					}
					batch = batch[:0]
				case <-ticker.C:
					// periodic flush if any
					if len(batch) > 0 {
						processGPSBatch(batch)
						for _, item := range batch {
							atomic.AddUint64(&processedGPS, 1)
							item.VehicleID = ""
							item.Lat = 0
							item.Lng = 0
							item.SpeedKph = 0
							item.Timestamp = 0
							gpsPool.Put(item)
						}
						batch = batch[:0]
					}
				}
			}
		}(i)
	}
}

func processGPSBatch(batch []*GPSPing) {
	// In a real pipeline you'd forward to Kafka/DB/analytics here.
	// We're marshaling to JSON as a cheap stand-in workload.
	// Reuse a single encoder buffer by local variable (no allocation per item).
	_, _ = json.Marshal(batch)
}

// orders processor
func startOrderProcessor(ctx context.Context, workers int) {
	for i := 0; i < workers; i++ {
		go func(id int) {
			batch := make([]*DeliveryOrder, 0, 128)
			ticker := time.NewTicker(1 * time.Second)
			defer ticker.Stop()
			for {
				select {
				case <-ctx.Done():
					return
				case o := <-orderIngestCh:
					batch = append(batch, o)
				DrainLoop:
					for len(batch) < 256 {
						select {
						case o2 := <-orderIngestCh:
							batch = append(batch, o2)
						default:
							break DrainLoop
						}
					}
					processOrderBatch(batch)
					for _, it := range batch {
						atomic.AddUint64(&processedOrder, 1)
						it.OrderID = ""
						it.PickupLat = 0
						it.PickupLng = 0
						it.DropLat = 0
						it.DropLng = 0
						it.CreatedAt = 0
						orderPool.Put(it)
					}
					batch = batch[:0]
				case <-ticker.C:
					if len(batch) > 0 {
						processOrderBatch(batch)
						for _, it := range batch {
							atomic.AddUint64(&processedOrder, 1)
							it.OrderID = ""
							it.PickupLat = 0
							it.PickupLng = 0
							it.DropLat = 0
							it.DropLng = 0
							it.CreatedAt = 0
							orderPool.Put(it)
						}
						batch = batch[:0]
					}
				}
			}
		}(i)
	}
}

func processOrderBatch(batch []*DeliveryOrder) {
	_, _ = json.Marshal(batch)
}

// Mock producers that generate the required rates and push into ingest channels.
// They simulate external sources (e.g., WebSocket/Kafka) but feed internal channels.
func startMockProducers(ctx context.Context) {
	// GPS producer: TARGET_GPS_PPS pings per second
	go func() {
		ticker := time.NewTicker(time.Second)
		defer ticker.Stop()
		perSecond := TARGET_GPS_PPS
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				// Spread the pings evenly across the second in small bursts
				burst := 50
				if perSecond < burst {
					burst = perSecond
				}
				interval := time.Second / time.Duration(perSecond)
				for i := 0; i < perSecond; i++ {
					p := gpsPool.Get().(*GPSPing)
					fillRandomGPS(p)
					select {
					case gpsIngestCh <- p:
						atomic.AddUint64(&receivedGPS, 1)
					default:
						// backpressure: drop oldest by non-blocking read to keep memory bounded
						select {
						case dropped := <-gpsIngestCh:
							// return dropped
							dropped.VehicleID = ""
							dropped.Lat = 0
							dropped.Lng = 0
							dropped.SpeedKph = 0
							dropped.Timestamp = 0
							gpsPool.Put(dropped)
						default:
						}
						// try insert again non-blocking
						select {
						case gpsIngestCh <- p:
							atomic.AddUint64(&receivedGPS, 1)
						default:
							// give up and put back to pool
							gpsPool.Put(p)
						}
					}
					time.Sleep(interval)
				}
			}
		}
	}()

	// Orders producer: TARGET_ORDERS_PER_MIN per minute
	go func() {
		ticker := time.NewTicker(time.Minute)
		defer ticker.Stop()
		perMinute := TARGET_ORDERS_PER_MIN
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				interval := time.Minute / time.Duration(perMinute)
				for i := 0; i < perMinute; i++ {
					o := orderPool.Get().(*DeliveryOrder)
					fillRandomOrder(o)
					select {
					case orderIngestCh <- o:
						atomic.AddUint64(&receivedOrder, 1)
					default:
						// backpressure handling (drop oldest)
						select {
						case dropped := <-orderIngestCh:
							dropped.OrderID = ""
							dropped.PickupLat = 0
							dropped.PickupLng = 0
							dropped.DropLat = 0
							dropped.DropLng = 0
							dropped.CreatedAt = 0
							orderPool.Put(dropped)
						default:
						}
						select {
						case orderIngestCh <- o:
							atomic.AddUint64(&receivedOrder, 1)
						default:
							orderPool.Put(o)
						}
					}
					time.Sleep(interval)
				}
			}
		}
	}()
}

// Fill helpers (cheap, reusing objects)
func fillRandomGPS(p *GPSPing) {
	p.VehicleID = fmt.Sprintf("veh-%08d", rand.Intn(10000000))
	// Random position around some center
	p.Lat = 40.0 + rand.Float64()*1.0
	p.Lng = -74.0 + rand.Float64()*1.0
	p.SpeedKph = rand.Float64()*120.0
	p.Timestamp = time.Now().UnixMilli()
}

func fillRandomOrder(o *DeliveryOrder) {
	o.OrderID = fmt.Sprintf("ord-%012d", rand.Intn(1000000000))
	o.PickupLat = 40.0 + rand.Float64()*1.0
	o.PickupLng = -74.0 + rand.Float64()*1.0
	o.DropLat = 40.0 + rand.Float64()*1.0
	o.DropLng = -74.0 + rand.Float64()*1.0
	o.CreatedAt = time.Now().UnixMilli()
}

// Expose a minimal WebSocket endpoint that accepts JSON messages for both pings and orders.
// Incoming messages are validated and placed into ingest channels using object pools.
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "upgrade failed", http.StatusBadRequest)
		return
	}
	defer conn.Close()
	for {
		mt, message, err := conn.ReadMessage()
		if err != nil {
			return
		}
		if mt != websocket.TextMessage && mt != websocket.BinaryMessage {
			continue
		}
		// try decode as gps ping first (fast path)
		var base map[string]any
		if err := json.Unmarshal(message, &base); err != nil {
			continue
		}
		// Simple type detection
		if _, ok := base["vehicle_id"]; ok {
			p := gpsPool.Get().(*GPSPing)
			if err := json.Unmarshal(message, p); err == nil {
				select {
				case gpsIngestCh <- p:
					atomic.AddUint64(&receivedGPS, 1)
				default:
					// drop oldest to keep memory bounded
					select {
					case dropped := <-gpsIngestCh:
						dropped.VehicleID = ""
						dropped.Lat = 0
						dropped.Lng = 0
						dropped.SpeedKph = 0
						dropped.Timestamp = 0
						gpsPool.Put(dropped)
					default:
					}
					select {
					case gpsIngestCh <- p:
						atomic.AddUint64(&receivedGPS, 1)
					default:
						gpsPool.Put(p)
					}
				}
			} else {
				gpsPool.Put(p)
			}
		} else if _, ok := base["order_id"]; ok {
			o := orderPool.Get().(*DeliveryOrder)
			if err := json.Unmarshal(message, o); err == nil {
				select {
				case orderIngestCh <- o:
					atomic.AddUint64(&receivedOrder, 1)
				default:
					select {
					case dropped := <-orderIngestCh:
						dropped.OrderID = ""
						dropped.PickupLat = 0
						dropped.PickupLng = 0
						dropped.DropLat = 0
						dropped.DropLng = 0
						dropped.CreatedAt = 0
						orderPool.Put(dropped)
					default:
					}
					select {
					case orderIngestCh <- o:
						atomic.AddUint64(&receivedOrder, 1)
					default:
						orderPool.Put(o)
					}
				}
			} else {
				orderPool.Put(o)
			}
		} else {
			// unknown payload, ignore
		}
	}
}

func metricsHandler(w http.ResponseWriter, r *http.Request) {
	resp := map[string]uint64{
		"received_gps":    atomic.LoadUint64(&receivedGPS),
		"processed_gps":   atomic.LoadUint64(&processedGPS),
		"received_orders": atomic.LoadUint64(&receivedOrder),
		"processed_orders": atomic.LoadUint64(&processedOrder),
		"gps_in_queue":    uint64(len(gpsIngestCh)),
		"orders_in_queue": uint64(len(orderIngestCh)),
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
}

func main() {
	// seed rng
	rand.Seed(time.Now().UnixNano())

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Start processors with moderate parallelism
	startGPSProcessor(ctx, 4)
	startOrderProcessor(ctx, 2)

	// Start mock producers
	startMockProducers(ctx)

	// HTTP endpoints: websocket ingest and simple metrics
	http.HandleFunc("/ws", wsHandler)
	http.HandleFunc("/metrics", metricsHandler)

	// Simple readiness check
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(200)
		w.Write([]byte("ok"))
	})

	server := &http.Server{
		Addr: ":8080",
	}

	// Graceful shutdown on interrupt
	go func() {
		log.Println("Listening on :8080 (WS /ws, metrics /metrics)")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
	}()

	// Print a periodic status line
	statusTicker := time.NewTicker(5 * time.Second)
	defer statusTicker.Stop()
	for {
		select {
		case <-statusTicker.C:
			log.Printf("recvGPS=%d procGPS=%d queueGPS=%d recvOrd=%d procOrd=%d queueOrd=%d\n",
				atomic.LoadUint64(&receivedGPS),
				atomic.LoadUint64(&processedGPS),
				len(gpsIngestCh),
				atomic.LoadUint64(&receivedOrder),
				atomic.LoadUint64(&processedOrder),
				len(orderIngestCh),
			)
		}
	}
}