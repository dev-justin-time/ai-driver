/* @tweakable how many segments of route line should stay ahead of the car */
const TRAIL_DISTANCE = 200; // meters
/* @tweakable delay in ms before removing passed segments */
const REMOVE_DELAY = 0;

/* @tweakable fuel consumption rate in liters per km */
const FUEL_CONSUMPTION_RATE = 0.1;
/* @tweakable how much fuel the car starts with in liters */
const FUEL_CAPACITY_LITERS = 50;
/* @tweakable display precision for liters remaining */
const LITERS_PRECISION = 1;

/* @tweakable maximum car health points */
const MAX_CAR_HEALTH = 100;
/* @tweakable chance of disaster per driving step (0-1) */
const DISASTER_CHANCE = 0.005;
/* @tweakable number of AI drivers to spawn */
const AI_DRIVER_COUNT = 5;
/* @tweakable AI driver icon colors */
const AI_DRIVER_COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'];

/* @tweakable how aggressively the AI follows the route (lower = more strict) */
const ROUTE_FOLLOW_STRENGTH = 0.8;
/* @tweakable how far ahead the AI looks for route adjustments (meters) */
const LOOK_AHEAD_DISTANCE = 50;
/* @tweakable smoothing factor for route following (0-1, higher = smoother) */
const TURN_SMOOTHING = 0.85;
/* @tweakable minimum distance to destination before stopping (meters) */
const DESTINATION_THRESHOLD = 20;
/* @tweakable how often the AI recalculates route (milliseconds) */
const ROUTE_RECALC_INTERVAL = 1000;
/* @tweakable AI reaction time in milliseconds (affects braking/speed changes) */
const AI_REACTION_TIME = 200;
/* @tweakable base acceleration rate (km/h per second) */
const ACCELERATION_RATE = 5;
/* @tweakable base deceleration rate (km/h per second) */
const DECELERATION_RATE = 8;
/* @tweakable how close to follow other vehicles (car lengths) */
const FOLLOW_DISTANCE = 3;
/* @tweakable speed reduction when following other vehicles (0-1) */
const FOLLOW_SPEED_REDUCTION = 0.7;

/* @tweakable how many road instructions to show */
const NAVIGATION_STEPS_AHEAD = 5;
/* @tweakable max distance in meters for AI drivers to spawn around main car */
const AI_SPAWN_RADIUS_KM = 0.01;
/* @tweakable minimum distance between AI drivers and main car */
const MIN_AI_DISTANCE_KM = 0.002;

/* @tweakable enable realistic traffic simulation */
const ENABLE_TRAFFIC = true;
/* @tweakable traffic density multiplier (0-1) */
const TRAFFIC_DENSITY = 0.3;
/* @tweakable enable dynamic weather effects */
const ENABLE_WEATHER = true;
/* @tweakable weather update interval in milliseconds */
const WEATHER_UPDATE_INTERVAL = 30000;
/* @tweakable enable day/night cycle */
const ENABLE_DAY_NIGHT = true;
/* @tweakable day/night cycle duration in minutes */
const DAY_NIGHT_DURATION = 5;
/* @tweakable enable realistic engine sounds */
const ENABLE_ENGINE_SOUNDS = true;
/* @tweakable engine sound volume (0-1) */
const ENGINE_VOLUME = 0.3;
/* @tweakable enable realistic physics */
const ENABLE_PHYSICS = true;
/* @tweakable enable tire wear simulation */
const ENABLE_TIRE_WEAR = true;
/* @tweakable tire wear rate multiplier */
const TIRE_WEAR_RATE = 1.0;
/* @tweakable enable realistic fuel prices */
const ENABLE_FUEL_PRICES = true;
/* @tweakable fuel price per liter in USD */
const FUEL_PRICE_PER_LITER = 0.85;
/* @tweakable enable realistic speed limits */
const ENABLE_SPEED_LIMITS = true;
/* @tweakable speed limit violation tolerance (km/h) */
const SPEED_LIMIT_TOLERANCE = 5;

/* @tweakable enable speed limit bypass mode */
const ENABLE_SPEED_LIMIT_BYPASS = true;
/* @tweakable speed limit bypass toggle key */
const SPEED_LIMIT_BYPASS_KEY = 'Shift';
/* @tweakable car additions spawn radius in meters */
const CAR_ADDITIONS_RADIUS = 100;

/* @tweakable multiplier for target speed when in Super Aggressive mode */
const SUPER_AGGRESSIVE_SPEED_MULTIPLIER = 2.5;
/* @tweakable multiplier for acceleration when in Super Aggressive mode */
const SUPER_AGGRESSIVE_ACCELERATION_MULTIPLIER = 2.0;
/* @tweakable multiplier for fuel consumption in Super Aggressive mode */
const SUPER_AGGRESSIVE_FUEL_MULTIPLIER = 1.8;
/* @tweakable multiplier for disaster chance when in Super Aggressive mode */
const SUPER_AGGRESSIVE_DISASTER_MULTIPLIER = 3.0;

/* @tweakable minimum enforced cruising speed (km/h) for Fast mode */
const FAST_MODE_MIN_SPEED = 200;

/* @tweakable fuel level percentage to trigger emergency refueling */
const LOW_FUEL_THRESHOLD = 0.2; // 20%
/* @tweakable search radius for fuel stations in meters */
const FUEL_STATION_SEARCH_RADIUS = 10000; // 10km
/* @tweakable average fuel prices per liter by country code (e.g., 'us', 'de') */
const FUEL_PRICES = { "us": 1.10, "de": 1.95, "fr": 1.90, "gb": 1.75, "ca": 1.40, "jp": 1.25, "au": 1.30, "pl": 1.55 };
/* @tweakable default fuel price if country not found */
const DEFAULT_FUEL_PRICE = 1.50;

/* @tweakable key to open the admin command prompt */
const COMMAND_PROMPT_KEY = 'Tab';

/* @tweakable compact UI: shrink controls and hide info panels when enabled */
const COMPACT_UI_ENABLED_BY_DEFAULT = false;

/* @tweakable compact UI scale (0.5 - 1.0) applied to control panel */
const COMPACT_UI_SCALE = 0.78;

/* @tweakable opacity for hidden panels when toggled (0-1) */
const UI_HIDDEN_OPACITY = 0.08;

/* @tweakable WebSocket ping interval in milliseconds (how often the client sends GPS pings) */
const WS_PING_INTERVAL_MS = 1000;

/* @tweakable unique vehicle id to use when sending pings from this client */
const WS_VEHICLE_ID = `client-${Math.floor(Math.random()*100000)}`;

/* @tweakable enable error popups */
const SHOW_ERROR_POPUPS = false;
/* @tweakable enable console error logging */
const LOG_ERRORS_TO_CONSOLE = true;

class AIDriverApp {
    constructor() {
        this.map = null;
        this.carMarker = null;
        this.destinationMarker = null;
        this.route = [];
        this.routeLine = null;
        /* @tweakable default starting city coordinates */
        this.currentPosition = { lat: 40.7128, lng: -74.0060 }; // NYC default
        /* @tweakable map zoom level when teleporting */
        this.teleportZoom = 15;
        /* @tweakable enable click to teleport by default */
        this.clickTeleportMode = false;
        /* @tweakable city geocoding cache timeout in ms */
        this.cacheTimeout = 1000 * 60 * 5; // 5 minutes
        this.cityCache = new Map();
        this.isDriving = false;
        /* @tweakable maximum cruising speed in km/h */
        this.maxSpeed = 10000;
        this.speed = 50;
        /* @tweakable current actual speed considering traffic/conditions */
        this.actualSpeed = 0;
        /* @tweakable target speed the AI is trying to reach */
        this.targetSpeed = 50;
        /* @tweakable driving style affects behavior */
        this.drivingStyle = 'normal';
        this.currentRouteIndex = 0;
        this.fuel = Infinity;
        this.maxFuel = FUEL_CAPACITY_LITERS;
        this.limitedFuelMode = false;
        /* @tweakable enable follow car mode */
        this.followCarMode = false;
        /* @tweakable zoom level when following car */
        this.followZoom = 17;
        /* @tweakable car health system */
        this.carHealth = MAX_CAR_HEALTH;
        this.disastersEnabled = false;
        /* @tweakable store AI drivers */
        this.aiDrivers = [];
        /* @tweakable route recalculation timer */
        this.routeRecalcTimer = null;
        
        /* @tweakable enable instant acceleration mode by default */
        this.instantAcceleration = false;
        
        /* @tweakable store navigation instructions */
        this.routeSteps = [];
        this.currentStepIndex = 0;
        
        this.speedLimitBypassMode = false;
        this.carAdditions = [];
        
        this.lowFuelThreshold = LOW_FUEL_THRESHOLD;
        this.fuelStationSearchRadius = FUEL_STATION_SEARCH_RADIUS;
        this.fuelPrices = FUEL_PRICES;
        this.defaultFuelPrice = DEFAULT_FUEL_PRICE;
        this.nearbyFuelStations = [];
        this.fuelStationMarkers = [];
        this.originalDestination = null;
        this.isRefueling = false;
        this.currentCountry = 'us';
        this.routeDuration = 0;
        this.routeStartTime = 0;
        
        /* @tweakable current weather conditions */
        this.weather = {
            type: 'clear',
            visibility: 1.0,
            rainIntensity: 0,
            temperature: 20
        };
        
        /* @tweakable current time of day */
        this.timeOfDay = 12; // 0-24 hours
        
        /* @tweakable traffic lights and signs */
        this.trafficElements = [];
        
        /* @tweakable engine sound instance */
        this.engineSound = null;
        
        /* @tweakable tire condition */
        this.tireCondition = 100;
        
        /* @tweakable fuel consumption based on driving habits */
        this.actualFuelConsumption = FUEL_CONSUMPTION_RATE;
        
        /* @tweakable speed limits from OSM data */
        this.speedLimits = new Map();
        
        /* @tweakable current speed limit */
        this.currentSpeedLimit = null;
        
        /* @tweakable enable realistic acceleration curves */
        this.accelerationCurve = 0.8;

        this.commands = {};
        
        /* @tweakable enable method auto-binding to avoid listener 'this' issues */
        this.updateSpeedLimitStatus = this.updateSpeedLimitStatus.bind(this);
        
        this.init();
    }
    
    init() {
        this.initMap();
        this.setupEventListeners();
        this.registerCommands();
        this.initWebSocket(); // start websocket pinging
        this.updateCarPosition();
        this.updateLocationInfo(this.currentPosition); // Initial location info
    }
    
    initMap() {
        this.map = L.map('map').setView([this.currentPosition.lat, this.currentPosition.lng], 15);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
        
        const carIcon = L.divIcon({
            html: '<div style="background: #00ff88; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0, 255, 136, 0.8);"></div>',
            iconSize: [20, 20],
            className: 'car-icon'
        });
        
        this.carMarker = L.marker([this.currentPosition.lat, this.currentPosition.lng], { icon: carIcon })
            .addTo(this.map)
            .bindPopup('<div class="popup-content">AI Driver</div>');
        
        this.map.on('click', (e) => {
            if (this.clickTeleportMode) {
                this.stopDriving();
                this.currentPosition = { lat: e.latlng.lat, lng: e.latlng.lng };
                this.updateCarPosition();
                this.map.setView([e.latlng.lat, e.latlng.lng], this.teleportZoom);
                
                // Clear destination and route
                if (this.destinationMarker) {
                    this.map.removeLayer(this.destinationMarker);
                    this.destinationMarker = null;
                }
                if (this.routeLine) {
                    this.map.removeLayer(this.routeLine);
                    if (this.routeLine.arrowDecorator) {
                        this.map.removeLayer(this.routeLine.arrowDecorator);
                    }
                }
                
                this.destination = null;
                this.route = [];
                
                document.getElementById('statusText').textContent = 'Teleported - Click anywhere to set destination';
            } else {
                this.setDestination(e.latlng);
            }
        });
    }
    
    setupEventListeners() {
        const speedSlider = document.getElementById('speedSlider');
        const speedValue = document.getElementById('speedValue');
        const stopBtn = document.getElementById('stopBtn');
        const resetBtn = document.getElementById('resetBtn');
        const fuelToggle = document.getElementById('fuelToggle');
        
        if (speedSlider) {
            speedSlider.max = this.maxSpeed;
            speedSlider.addEventListener('input', (e) => {
                this.speed = parseInt(e.target.value);
                this.targetSpeed = this.speed;
                speedValue.textContent = this.speed;
            });
        }
        
        if (stopBtn) stopBtn.addEventListener('click', () => this.stopDriving());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetPosition());
        
        if (fuelToggle) {
            fuelToggle.addEventListener('change', (e) => {
                this.limitedFuelMode = e.target.checked;
                if (this.limitedFuelMode) {
                    this.fuel = this.maxFuel;
                } else {
                    this.fuel = Infinity;
                }
                this.updateFuelDisplay();
            });
        }
        
        const cityInput = document.getElementById('cityInput');
        const teleportBtn = document.getElementById('teleportBtn');
        const clickTeleportToggle = document.getElementById('clickTeleportToggle');
        const followCarToggle = document.getElementById('followCarToggle');
        const drivingStyle = document.getElementById('drivingStyle');
        const disastersToggle = document.getElementById('disastersToggle');
        const spawnAIBtn = document.getElementById('spawnAIBtn');
        const instantAccelerationToggle = document.getElementById('instantAccelerationToggle');
        
        teleportBtn.addEventListener('click', () => this.teleportToCity(cityInput.value));
        
        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.teleportToCity(cityInput.value);
            }
        });
        
        clickTeleportToggle.addEventListener('change', (e) => {
            this.clickTeleportMode = e.target.checked;
        });
        
        followCarToggle.addEventListener('change', (e) => {
            this.followCarMode = e.target.checked;
            if (this.followCarMode && this.isDriving) {
                this.map.setView([this.currentPosition.lat, this.currentPosition.lng], this.followZoom);
            }
        });
        
        drivingStyle.addEventListener('change', (e) => {
            this.drivingStyle = e.target.value;
        });
        
        disastersToggle.addEventListener('change', (e) => {
            this.disastersEnabled = e.target.checked;
        });
        
        spawnAIBtn.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.spawnAIDrivers();
            } else {
                this.removeAIDrivers();
            }
        });

        if (instantAccelerationToggle) {
            instantAccelerationToggle.addEventListener('change', (e) => {
                this.instantAcceleration = e.target.checked;
            });
        }

        // compact mode and toggle-all UI elements
        const compactToggle = document.getElementById('compactModeToggle');
        const toggleAllBtn = document.getElementById('toggleAllPanelsBtn');
        const controlsPanel = document.getElementById('controlsPanel');
        const navPanel = document.querySelector('.navigation-panel');
        const infoPanel = document.querySelector('.info-panel');
        const navigationDisplay = document.getElementById('navigation-display');

        // Initialize compact mode state (tweakable)
        if (compactToggle) {
            compactToggle.checked = COMPACT_UI_ENABLED_BY_DEFAULT;
            if (COMPACT_UI_ENABLED_BY_DEFAULT) this.applyCompactUI(true);
            compactToggle.addEventListener('change', (e) => {
                this.applyCompactUI(e.target.checked);
            });
        }

        if (toggleAllBtn) {
            toggleAllBtn.addEventListener('click', () => {
                this.toggleAllPanelsVisibility();
            });
        }

        const errorModal = document.getElementById('errorModal');
        const errorCloseBtn = document.getElementById('errorCloseBtn');
        if(errorCloseBtn) {
            errorCloseBtn.addEventListener('click', () => {
                errorModal.style.display = 'none';
            });
        }
        
        const speedLimitBypassToggle = document.createElement('label');
        speedLimitBypassToggle.innerHTML = `
            <input type="checkbox" id="speedLimitBypassToggle"> Speed Limit Bypass
        `;
        document.querySelector('.controls').appendChild(speedLimitBypassToggle);
        
        document.getElementById('speedLimitBypassToggle').addEventListener('change', (e) => {
            this.speedLimitBypassMode = e.target.checked;
            this.updateSpeedLimitStatus();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === COMMAND_PROMPT_KEY) {
                e.preventDefault();
                this.toggleCommandPrompt();
            }
        });

        const commandInput = document.getElementById('commandInput');
        commandInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && commandInput.value) {
                this.executeCommand(commandInput.value);
                commandInput.value = '';
            }
        });
    }

    toggleCommandPrompt() {
        const prompt = document.getElementById('commandPrompt');
        const input = document.getElementById('commandInput');
        const output = document.getElementById('commandOutput');

        if (prompt.style.display === 'none') {
            prompt.style.display = 'flex';
            input.focus();
            input.value = '';
            output.innerHTML = ''; // Clear previous output
            this.logToCommandPrompt('Admin prompt opened. Type "help" for a list of commands.');
        } else {
            prompt.style.display = 'none';
        }
    }

    /* Compact UI helper: hide or shrink non-essential panels to improve layout */
    /* @tweakable toggles compact UI on/off */
    applyCompactUI(enable) {
        const controlsPanel = document.getElementById('controlsPanel');
        const navPanel = document.querySelector('.navigation-panel');
        const infoPanel = document.querySelector('.info-panel');
        const navigationDisplay = document.getElementById('navigation-display');

        if (enable) {
            if (controlsPanel) {
                controlsPanel.style.transform = `scale(${COMPACT_UI_SCALE})`;
                controlsPanel.style.transition = 'transform 0.2s, opacity 0.2s';
                controlsPanel.style.opacity = '0.95';
                controlsPanel.style.width = '240px';
            }
            if (navPanel) {
                navPanel.style.opacity = `${UI_HIDDEN_OPACITY}`;
                navPanel.style.pointerEvents = 'none';
            }
            if (infoPanel) {
                infoPanel.style.opacity = `${UI_HIDDEN_OPACITY}`;
                infoPanel.style.pointerEvents = 'none';
            }
            if (navigationDisplay) {
                navigationDisplay.style.opacity = `${UI_HIDDEN_OPACITY}`;
                navigationDisplay.style.pointerEvents = 'none';
            }
        } else {
            if (controlsPanel) {
                controlsPanel.style.transform = '';
                controlsPanel.style.opacity = '';
                controlsPanel.style.width = '';
                controlsPanel.style.pointerEvents = '';
            }
            if (navPanel) {
                navPanel.style.opacity = '';
                navPanel.style.pointerEvents = '';
            }
            if (infoPanel) {
                infoPanel.style.opacity = '';
                infoPanel.style.pointerEvents = '';
            }
            if (navigationDisplay) {
                navigationDisplay.style.opacity = '';
                navigationDisplay.style.pointerEvents = '';
            }
        }
    }

    /* Toggle visibility of all UI panels (useful to "iogglr all") */
    /* @tweakable whether toggled panels are hidden (opacity) or removed from layout */
    toggleAllPanelsVisibility() {
        const panels = [
            document.getElementById('controlsPanel'),
            document.querySelector('.info-panel'),
            document.querySelector('.navigation-panel'),
            document.getElementById('navigation-display'),
            document.getElementById('commandPrompt'),
            document.getElementById('errorModal')
        ].filter(Boolean);

        // If any panel is visible-ish, hide them; else show them
        const anyVisible = panels.some(p => {
            const op = window.getComputedStyle(p).opacity;
            return op === '' || parseFloat(op) > 0.2;
        });

        panels.forEach(p => {
            if (anyVisible) {
                p.dataset._prevDisplay = p.style.display || '';
                p.style.transition = 'opacity 0.2s';
                p.style.opacity = UI_HIDDEN_OPACITY;
                p.style.pointerEvents = 'none';
            } else {
                p.style.opacity = p.dataset._prevOpacity || '';
                p.style.pointerEvents = '';
                p.style.display = p.dataset._prevDisplay || '';
            }
        });
    }

    logToCommandPrompt(message, isError = false) {
        const output = document.getElementById('commandOutput');
        const line = document.createElement('div');
        line.textContent = `> ${message}`;
        if (isError) {
            line.style.color = '#ff4444';
        }
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
    }

    registerCommands() {
        this.commands['help'] = {
            description: 'Lists all available commands.',
            handler: () => {
                this.logToCommandPrompt('Available commands:');
                Object.keys(this.commands).forEach(cmd => {
                    this.logToCommandPrompt(`  ${cmd} - ${this.commands[cmd].description}`);
                });
            }
        };

        this.commands['fuel'] = {
            description: 'Set fuel amount. Usage: fuel <amount|full|infinite>',
            handler: (args) => {
                if (args.length === 0) {
                    return this.logToCommandPrompt('Usage: fuel <amount|full|infinite>', true);
                }
                const value = args[0].toLowerCase();
                if (value === 'infinite') {
                    this.limitedFuelMode = false;
                    this.fuel = Infinity;
                    this.logToCommandPrompt('Fuel set to unlimited.');
                } else if (value === 'full') {
                    this.limitedFuelMode = true;
                    this.fuel = this.maxFuel;
                    this.logToCommandPrompt(`Fuel tank filled to ${this.maxFuel}L.`);
                } else {
                    const amount = parseFloat(value);
                    if (!isNaN(amount) && amount >= 0) {
                        this.limitedFuelMode = true;
                        this.fuel = Math.min(amount, this.maxFuel);
                        this.logToCommandPrompt(`Fuel set to ${this.fuel.toFixed(LITERS_PRECISION)}L.`);
                    } else {
                        return this.logToCommandPrompt('Invalid fuel amount.', true);
                    }
                }
                this.updateFuelDisplay();
            }
        };

        this.commands['teleport'] = {
            description: 'Teleport to a city. Usage: teleport <city name>',
            handler: (args) => {
                if (args.length === 0) {
                    return this.logToCommandPrompt('Usage: teleport <city name>', true);
                }
                const cityName = args.join(' ');
                this.teleportToCity(cityName);
                this.logToCommandPrompt(`Attempting to teleport to ${cityName}...`);
            }
        };

        this.commands['speed'] = {
            description: 'Set cruising speed. Usage: speed <km/h>',
            handler: (args) => {
                if (args.length === 0) {
                    return this.logToCommandPrompt('Usage: speed <km/h>', true);
                }
                const newSpeed = parseInt(args[0]);
                if (!isNaN(newSpeed) && newSpeed >= 10 && newSpeed <= this.maxSpeed) {
                    this.speed = newSpeed;
                    this.targetSpeed = newSpeed;
                    document.getElementById('speedSlider').value = newSpeed;
                    document.getElementById('speedValue').textContent = newSpeed;
                    this.logToCommandPrompt(`Cruising speed set to ${newSpeed} km/h.`);
                } else {
                     this.logToCommandPrompt(`Invalid speed. Must be between 10 and ${this.maxSpeed}.`, true);
                }
            }
        };
        
        this.commands['clear'] = {
            description: 'Clears the command prompt output.',
            handler: () => {
                document.getElementById('commandOutput').innerHTML = '';
            }
        };

        this.commands['close'] = {
            description: 'Closes the command prompt.',
            handler: () => {
                this.toggleCommandPrompt();
            }
        };
    }

    executeCommand(input) {
        this.logToCommandPrompt(input);
        const parts = input.trim().split(/\s+/);
        const commandName = parts[0].toLowerCase();
        const args = parts.slice(1);

        if (this.commands[commandName]) {
            try {
                this.commands[commandName].handler(args);
            } catch (error) {
                this.logToCommandPrompt(`Error executing command "${commandName}": ${error.message}`, true);
                console.error(error);
            }
        } else {
            this.logToCommandPrompt(`Unknown command: "${commandName}". Type "help" for a list of commands.`, true);
        }
    }
    
    async setDestination(latlng) {
        if (this.destinationMarker) {
            this.map.removeLayer(this.destinationMarker);
        }
        
        this.destination = { lat: latlng.lat, lng: latlng.lng };
        
        this.destinationMarker = L.marker(latlng)
            .addTo(this.map)
            .bindPopup('<div class="popup-content">Destination</div>');
        
        // Snap destination to nearest road using reverse geocoding
        const roadLocation = await this.findNearestRoad(latlng);
        if (roadLocation) {
            this.destination = { lat: roadLocation.lat, lng: roadLocation.lng };
            this.destinationMarker.setLatLng([roadLocation.lat, roadLocation.lng]);
        }
        
        if (!this.isRefueling) {
            this.updateLocationInfo(this.currentPosition);
        }

        await this.calculateRoute();
    }
    
    async findNearestRoad(latlng) {
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}`
            );
            const data = await response.json();
            if (data && data.lat && data.lon) {
                return { lat: parseFloat(data.lat), lng: parseFloat(data.lon) };
            }
        } catch (e) {
            console.log('Road snapping failed, using original location');
            this.showError('Road Snapping Failed', e);
        }
        return null;
    }
    
    async calculateRoute() {
        if (!this.destination) return;
        
        document.getElementById('statusText').textContent = 'Calculating route...';
        
        try {
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${this.currentPosition.lng},${this.currentPosition.lat};${this.destination.lng},${this.destination.lat}?overview=full&geometries=geojson&alternatives=true&steps=true`
            );
            const data = await response.json();
            
            if (data.routes && data.routes.length > 0) {
                // Choose the best route (fastest)
                const route = data.routes.reduce((best, current) => 
                    current.duration < best.duration ? current : best
                );
                
                this.route = route.geometry.coordinates.map(coord => ({
                    lng: coord[0],
                    lat: coord[1]
                }));

                // Store route metadata
                this.routeDuration = route.duration;
                this.routeStartTime = Date.now();
                this.routeSteps = route.legs[0].steps;
                this.currentStepIndex = 0;
                
                // Parse navigation instructions
                this.navigationInstructions = this.parseNavigationInstructions(route); // Old property, can be removed later
                this.updateNavigationDisplay();
                
                if (this.routeLine) {
                    this.map.removeLayer(this.routeLine);
                    if (this.routeLine.arrowDecorator) {
                        this.map.removeLayer(this.routeLine.arrowDecorator);
                    }
                }
                
                // Add blue route line with arrow markers
                this.routeLine = L.polyline(this.route.map(p => [p.lat, p.lng]), {
                    color: '#0066ff',
                    weight: 6,
                    opacity: 0.9,
                    dashArray: '15, 10',
                    lineCap: 'round',
                    lineJoin: 'round'
                }).addTo(this.map);
                
                // Add directional arrows
                const arrowDecorator = L.polylineDecorator(this.routeLine, {
                    patterns: [{
                        offset: '50%',
                        repeat: 200,
                        symbol: L.Symbol.arrowHead({
                            pixelSize: 15,
                            polygon: false,
                            pathOptions: {
                                stroke: true,
                                weight: 2,
                                color: '#ffffff'
                            }
                        })
                    }]
                }).addTo(this.map);
                
                // Store reference for cleanup
                this.routeLine.arrowDecorator = arrowDecorator;
                
                this.startDriving();
            } else {
                document.getElementById('statusText').textContent = 'No route found';
                this.showError('Routing Error', 'Could not find a route to the destination.');
            }
        } catch (error) {
            console.error('Route calculation failed:', error);
            this.showError('Route Calculation Failed', error);
            document.getElementById('statusText').textContent = 'Route calculation failed - trying again...';
            setTimeout(() => this.calculateRoute(), 2000);
        }
    }
    
    parseNavigationInstructions(route) {
        // This function is now largely replaced by direct use of routeSteps, 
        // but we can keep it for simple list generation if needed elsewhere.
        const instructions = [];
        
        if (route.legs && route.legs[0] && route.legs[0].steps) {
            const steps = route.legs[0].steps;
            
            for (let i = 0; i < Math.min(steps.length, NAVIGATION_STEPS_AHEAD); i++) {
                const step = steps[i];
                const name = step.name || 'Unnamed Road';
                const distance = (step.distance / 1000).toFixed(1);
                
                let arrow = '→';
                let instruction = step.maneuver?.type || 'straight';
                
                switch (instruction) {
                    case 'turn-left':
                        arrow = '↰';
                        break;
                    case 'turn-right':
                        arrow = '↱';
                        break;
                    case 'roundabout':
                        arrow = '↻';
                        break;
                    case 'continue':
                        arrow = '→';
                        break;
                    case 'depart':
                        arrow = '↑';
                        break;
                    case 'arrive':
                        arrow = '🏁';
                        break;
                    default:
                        arrow = '→';
                }
                
                instructions.push({
                    arrow,
                    name,
                    distance: `${distance}km`
                });
            }
        }
        
        return instructions;
    }
    
    displayNavigationInstructions() {
        // DEPRECATED in favor of updateNavigationDisplay
        return;
    }
    
    startDriving() {
        if (this.route.length === 0) return;
        
        this.isDriving = true;
        this.currentRouteIndex = 0;
        this.targetSpeed = this.speed;
        this.actualSpeed = 0;
        
        document.getElementById('statusText').textContent = this.isRefueling ? 'Emergency refuel...' : 'AI Driver is navigating...';
        
        // Start route recalculation for dynamic routing
        this.startRouteRecalculation();
        
        this.driveStep();
    }
    
    startRouteRecalculation() {
        this.routeRecalcTimer = setInterval(() => {
            if (this.destination && this.isDriving) {
                // Check if we need to recalculate due to traffic or better route
                this.checkForBetterRoute();
            }
        }, ROUTE_RECALC_INTERVAL);
    }
    
    async checkForBetterRoute() {
        try {
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${this.currentPosition.lng},${this.currentPosition.lat};${this.destination.lng},${this.destination.lat}?overview=full&geometries=geojson&alternatives=true`
            );
            const data = await response.json();
            
            if (data.routes && data.routes.length > 0) {
                const newRoute = data.routes.reduce((best, current) => 
                    current.duration < best.duration ? current : best
                );
                
                const newRouteCoords = newRoute.geometry.coordinates.map(coord => ({
                    lng: coord[0],
                    lat: coord[1]
                }));
                
                // Only update if significantly better
                if (newRoute.duration < this.currentRouteDuration * 0.9) {
                    this.route = newRouteCoords;
                    this.updateRouteLine();
                }
            }
        } catch (error) {
            console.log('Route recalculation failed:', error);
            this.showError('Route Recalculation Failed', error);
        }
    }
    
    updateRouteLine() {
        if (this.routeLine) {
            this.map.removeLayer(this.routeLine);
            if (this.routeLine.arrowDecorator) {
                this.map.removeLayer(this.routeLine.arrowDecorator);
            }
        }
        
        if (this.route.length > 0) {
            this.routeLine = L.polyline(this.route.map(p => [p.lat, p.lng]), {
                color: '#0066ff',
                weight: 6,
                opacity: 0.9,
                dashArray: '15, 10',
                lineCap: 'round',
                lineJoin: 'round'
            }).addTo(this.map);
            
            // Add arrows for remaining route
            const arrowDecorator = L.polylineDecorator(this.routeLine, {
                patterns: [{
                    offset: '50%',
                    repeat: 200,
                    symbol: L.Symbol.arrowHead({
                        pixelSize: 15,
                        polygon: false,
                        pathOptions: {
                            stroke: true,
                            weight: 2,
                            color: '#ffffff'
                        }
                    })
                }]
            }).addTo(this.map);
            
            this.routeLine.arrowDecorator = arrowDecorator;
        }
    }
    
    driveStep() {
        if (!this.isDriving) return;
        
        if (this.currentRouteIndex >= this.route.length || 
            this.calculateDistance(this.currentPosition, this.destination) < DESTINATION_THRESHOLD / 1000) {
            
            if (this.isRefueling) {
                this.handleRefueling();
            } else {
                document.getElementById('statusText').textContent = 'Destination reached!';
            }
            this.stopDriving();
            return;
        }
        
        if (this.limitedFuelMode && this.fuel <= 0) {
            this.stopDriving();
            document.getElementById('statusText').textContent = 'Out of fuel!';
            return;
        }

        if (this.limitedFuelMode && this.fuel < (this.maxFuel * this.lowFuelThreshold) && !this.isRefueling) {
            this.startEmergencyRefuel();
        }
        
        // AI decision making
        this.makeAIDecision();
        
        // Calculate next position
        const nextPoint = this.calculateNextPosition();
        
        // Update fuel
        if (this.limitedFuelMode) {
            const distance = this.calculateDistance(this.currentPosition, nextPoint);
            this.fuel -= (distance * this.actualFuelConsumption);
            this.updateFuelDisplay();
        }
        
        // Update position
        this.currentPosition = nextPoint;
        this.updateCarPosition();
        
        // Update camera if following
        if (this.followCarMode) {
            this.map.setView([this.currentPosition.lat, this.currentPosition.lng], this.followZoom);
        }
        
        // Update displays
        const remainingDistance = this.calculateDistance(
            this.currentPosition,
            this.destination
        );
        document.getElementById('distanceText').textContent = `${remainingDistance.toFixed(1)} km`;
        document.getElementById('currentSpeed').textContent = `${Math.round(this.actualSpeed)} km/h`;
        
        const elapsedSeconds = (Date.now() - this.routeStartTime) / 1000;
        const remainingSeconds = Math.max(0, this.routeDuration - elapsedSeconds);
        const eta = new Date(remainingSeconds * 1000).toISOString().substr(11, 8);
        document.getElementById('etaText').textContent = eta;

        // Trim passed route segments
        this.trimOldRoute();
        
        // Update navigation progress
        this.updateNavigationProgress();
        
        // Continue driving
        const nextStepDelay = Math.max(50, AI_REACTION_TIME);
        setTimeout(() => this.driveStep(), nextStepDelay);
    }
    
    updateNavigationProgress() {
        if (!this.isDriving || !this.routeSteps || this.currentStepIndex >= this.routeSteps.length -1) return;

        const nextStep = this.routeSteps[this.currentStepIndex + 1];
        if(!nextStep) return;

        const nextStepLocation = { lat: nextStep.maneuver.location[1], lng: nextStep.maneuver.location[0] };
        
        const distanceToNextManeuver = this.calculateDistance(this.currentPosition, nextStepLocation) * 1000;

        // If we are close to the next maneuver, advance the step
        if(distanceToNextManeuver < 30) {
            this.currentStepIndex++;
        }
        this.updateNavigationDisplay();
    }
    
    makeAIDecision() {
        // Weather effects
        const weatherModifier = this.weather.visibility * (1 - this.weather.rainIntensity * 0.3);
        
        // Tire condition effects
        const tireModifier = this.tireCondition / 100;
        
        // Combined modifier
        const combinedModifier = weatherModifier * tireModifier;
        
        // Apply to target speed (normal)
        this.targetSpeed = Math.min(this.speed, this.speed * combinedModifier);

        // Fast mode: enforce a minimum cruising speed
        if (this.drivingStyle === 'fast') {
            this.targetSpeed = Math.max(this.targetSpeed, FAST_MODE_MIN_SPEED);
            // Ensure maxSpeed allows Fast mode to function
            if (this.maxSpeed < FAST_MODE_MIN_SPEED) {
                this.maxSpeed = FAST_MODE_MIN_SPEED;
            }
        }
        
        // Super Aggressive mode overrides & multipliers (existing logic)
        if (this.drivingStyle === 'super-aggressive') {
            // Increase base target speed aggressively
            this.targetSpeed = Math.min(this.maxSpeed, this.targetSpeed * SUPER_AGGRESSIVE_SPEED_MULTIPLIER);
            // Increase disaster chance while driving extremely fast
            if (this.disastersEnabled && Math.random() < (DISASTER_CHANCE * SUPER_AGGRESSIVE_DISASTER_MULTIPLIER)) {
                this.triggerDisaster();
            }
        }
        
        if (this.instantAcceleration) {
            this.actualSpeed = this.targetSpeed;
            return;
        }
        
        // Apply accelerated acceleration for Super Aggressive mode
        const accelRate = (this.drivingStyle === 'super-aggressive') ? ACCELERATION_RATE * SUPER_AGGRESSIVE_ACCELERATION_MULTIPLIER : ACCELERATION_RATE;
        const decelRate = (this.drivingStyle === 'super-aggressive') ? Math.max(DECELERATION_RATE * 0.8, 5) : DECELERATION_RATE;
        
        // If in Fast mode, slightly increase acceleration so it reaches the enforced minimum faster
        const finalAccelRate = (this.drivingStyle === 'fast') ? accelRate * 1.5 : accelRate;

        if (this.actualSpeed < this.targetSpeed) {
            this.actualSpeed = Math.min(
                this.targetSpeed,
                this.actualSpeed + finalAccelRate * (AI_REACTION_TIME / 1000)
            );
        } else {
            this.actualSpeed = Math.max(
                0,
                this.actualSpeed - decelRate * (AI_REACTION_TIME / 1000)
            );
        }
    }
    
    calculateNextPosition() {
        if (this.currentRouteIndex >= this.route.length) {
            return this.currentPosition;
        }
        
        const nextRoutePoint = this.route[this.currentRouteIndex];
        const distanceToNext = this.calculateDistance(this.currentPosition, {
            lat: nextRoutePoint.lat,
            lng: nextRoutePoint.lng
        });
        
        const moveDistance = (this.actualSpeed / 3600) * (AI_REACTION_TIME / 1000);
        
        if (moveDistance >= distanceToNext) {
            // Move to next route point
            this.currentRouteIndex++;
            return { lat: nextRoutePoint.lat, lng: nextRoutePoint.lng };
        } else {
            // Interpolate position
            const bearing = this.calculateBearing(
                this.currentPosition,
                { lat: nextRoutePoint.lat, lng: nextRoutePoint.lng }
            );
            
            const newPos = this.calculateDestination(
                this.currentPosition,
                bearing,
                moveDistance
            );
            
            // Apply driving style effects
            if (this.drivingStyle === 'drunk' || this.drivingStyle === 'chaotic') {
                const deviation = this.drivingStyle === 'drunk' ? 0.001 : 0.005;
                newPos.lat += (Math.random() - 0.5) * deviation;
                newPos.lng += (Math.random() - 0.5) * deviation;
            }
            
            return newPos;
        }
    }
    
    calculateBearing(start, end) {
        const startLat = start.lat * Math.PI / 180;
        const startLng = start.lng * Math.PI / 180;
        const endLat = end.lat * Math.PI / 180;
        const endLng = end.lng * Math.PI / 180;
        
        const dLng = endLng - startLng;
        const y = Math.sin(dLng) * Math.cos(endLat);
        const x = Math.cos(startLat) * Math.sin(endLat) -
                  Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);
        
        return Math.atan2(y, x);
    }
    
    calculateDestination(start, bearing, distance) {
        const R = 6371;
        const d = distance;
        const lat1 = start.lat * Math.PI / 180;
        const lng1 = start.lng * Math.PI / 180;
        const brng = bearing;
        
        const lat2 = Math.asin(Math.sin(lat1) * Math.cos(d/R) +
                              Math.cos(lat1) * Math.sin(d/R) * Math.cos(brng));
        const lng2 = lng1 + Math.atan2(Math.sin(brng) * Math.sin(d/R) * Math.cos(lat1),
                                      Math.cos(d/R) - Math.sin(lat1) * Math.sin(lat2));
        
        return {
            lat: lat2 * 180 / Math.PI,
            lng: lng2 * 180 / Math.PI
        };
    }
    
    getNextRouteSegment() {
        const lookAhead = Math.min(
            this.currentRouteIndex + Math.floor(LOOK_AHEAD_DISTANCE / 100),
            this.route.length
        );
        
        if (lookAhead <= this.currentRouteIndex + 1) return null;
        
        return this.route.slice(this.currentRouteIndex, lookAhead);
    }
    
    calculateCurvature(segment) {
        if (segment.length < 3) return 0;
        
        let totalAngle = 0;
        for (let i = 1; i < segment.length - 1; i++) {
            const prev = segment[i-1];
            const curr = segment[i];
            const next = segment[i+1];
            
            const angle1 = this.calculateBearing(
                {lat: prev.lat, lng: prev.lng},
                {lat: curr.lat, lng: curr.lng}
            );
            const angle2 = this.calculateBearing(
                {lat: curr.lat, lng: curr.lng},
                {lat: next.lat, lng: next.lng}
            );
            
            totalAngle += Math.abs(angle2 - angle1);
        }
        
        return totalAngle / segment.length;
    }
    
    async driveAIStep(aiDriver) {
        if (!aiDriver.isDriving || aiDriver.route.length === 0) {
            // Set new destination
            const newLat = aiDriver.position.lat + (Math.random() - 0.5) * 0.1;
            const newLng = aiDriver.position.lng + (Math.random() - 0.5) * 0.1;
            aiDriver.destination = { lat: newLat, lng: newLng };
            await this.calculateAIRoute(aiDriver);
            return;
        }
        
        const nextPoint = aiDriver.route.shift();
        if (nextPoint) {
            aiDriver.position = { lat: nextPoint.lat, lng: nextPoint.lng };
            aiDriver.marker.setLatLng([nextPoint.lat, nextPoint.lng]);
            
            // Update route line
            if (aiDriver.routeLine) {
                this.map.removeLayer(aiDriver.routeLine);
                const remaining = aiDriver.route.map(p => [p.lat, p.lng]);
                aiDriver.routeLine = L.polyline(remaining, {
                    color: '#ff6b6b',
                    weight: 3,
                    opacity: 0.6,
                    dashArray: '5, 5'
                }).addTo(this.map);
            }
            
            const delay = 3000 / (aiDriver.speed / 30);
            setTimeout(() => this.driveAIStep(aiDriver), delay);
        }
    }
    
    async calculateAIRoute(aiDriver) {
        try {
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${aiDriver.position.lng},${aiDriver.position.lat};${aiDriver.destination.lng},${aiDriver.destination.lat}?overview=full&geometries=geojson`
            );
            const data = await response.json();
            
            if (data.routes && data.routes.length > 0) {
                const route = data.routes[0];
                aiDriver.route = route.geometry.coordinates.map(coord => ({
                    lng: coord[0],
                    lat: coord[1]
                }));
                
                // Add route line
                aiDriver.routeLine = L.polyline(aiDriver.route.map(p => [p.lat, p.lng]), {
                    color: '#ff6b6b',
                    weight: 3,
                    opacity: 0.6,
                    dashArray: '5, 5'
                }).addTo(this.map);
                
                this.driveAIStep(aiDriver);
            }
        } catch (error) {
            console.error('AI route calculation failed:', error);
        }
    }
    
    spawnAIDrivers() {
        for (let i = 0; i < AI_DRIVER_COUNT; i++) {
            this.createAIDriver(i);
        }
    }
    
    async createAIDriver(index) {
        const color = AI_DRIVER_COLORS[index % AI_DRIVER_COLORS.length];
        const icon = L.divIcon({
            html: `<div style="background: ${color}; width: 15px; height: 15px; border-radius: 50%; border: 1px solid white; box-shadow: 0 0 5px ${color}80;"></div>`,
            iconSize: [15, 15],
            className: 'ai-car-icon'
        });
        
        // Spawn near main car with random offset
        let lat, lng;
        do {
            lat = this.currentPosition.lat + (Math.random() - 0.5) * AI_SPAWN_RADIUS_KM * 2;
            lng = this.currentPosition.lng + (Math.random() - 0.5) * AI_SPAWN_RADIUS_KM * 2;
        } while (
            this.calculateDistance(
                { lat, lng }, 
                this.currentPosition
            ) < MIN_AI_DISTANCE_KM
        );
        
        const marker = L.marker([lat, lng], { icon })
            .addTo(this.map)
            .bindPopup(`<div class="popup-content">AI Driver ${index + 1}</div>`);
        
        // Set random destination within reasonable range
        const destLat = lat + (Math.random() - 0.5) * 0.05;
        const destLng = lng + (Math.random() - 0.5) * 0.05;
        
        const aiDriver = {
            marker,
            position: { lat, lng },
            destination: { lat: destLat, lng: destLng },
            speed: 30 + Math.random() * 40,
            isDriving: true,
            route: [],
            routeLine: null
        };
        
        this.aiDrivers.push(aiDriver);
        await this.calculateAIRoute(aiDriver);
    }
    
    removeAIDrivers() {
        this.aiDrivers.forEach(aiDriver => {
            if (aiDriver.marker) this.map.removeLayer(aiDriver.marker);
            if (aiDriver.routeLine) this.map.removeLayer(aiDriver.routeLine);
        });
        this.aiDrivers = [];
    }
    
    stopDriving() {
        this.isDriving = false;
        if (this.routeRecalcTimer) {
            clearInterval(this.routeRecalcTimer);
            this.routeRecalcTimer = null;
        }
        document.getElementById('statusText').textContent = 'AI Driver stopped';
    }
    
    resetPosition() {
        this.stopDriving();
        this.currentPosition = { lat: 40.7128, lng: -74.0060 };
        this.updateCarPosition();
        this.map.setView([this.currentPosition.lat, this.currentPosition.lng], 15);
        
        if (this.routeLine) {
            this.map.removeLayer(this.routeLine);
            if (this.routeLine.arrowDecorator) {
                this.map.removeLayer(this.routeLine.arrowDecorator);
            }
            this.routeLine = null;
        }
        
        if (this.limitedFuelMode) {
            this.fuel = this.maxFuel;
            this.updateFuelDisplay();
        }
        
        // Reset car health
        this.carHealth = MAX_CAR_HEALTH;
        this.updateHealthDisplay();
        
        document.getElementById('statusText').textContent = 'Ready - Click anywhere to set destination';
    }
    
    updateFuelDisplay() {
        const fuelDisplay = document.getElementById('fuelDisplay');
        if (this.limitedFuelMode) {
            const percent = Math.round((this.fuel / this.maxFuel) * 100);
            fuelDisplay.textContent = `${percent}% / ${this.fuel.toFixed(LITERS_PRECISION)}L`;
            fuelDisplay.style.color = this.fuel < 10 ? '#ff4444' : '#888';
        } else {
            fuelDisplay.textContent = '∞ Unlimited';
            fuelDisplay.style.color = '#888';
        }
    }
    
    updateHealthDisplay() {
        const healthDisplay = document.getElementById('healthDisplay');
        healthDisplay.textContent = `${this.carHealth}%`;
        healthDisplay.style.color = this.carHealth < 30 ? '#ff4444' : '#888';
    }
    
    updateCarPosition() {
        this.carMarker.setLatLng([this.currentPosition.lat, this.currentPosition.lng]);
    }
    
    triggerDisaster() {
        const disasters = [
            /* @tweakable disaster types and their effects */
            { name: 'Flat Tire', health: 10, message: 'Flat tire! Health -10%' },
            { name: 'Engine Overheat', health: 15, message: 'Engine overheating! Health -15%' },
            { name: 'Rain Storm', health: 5, message: 'Heavy rain reduces visibility! Health -5%' },
            { name: 'Pothole', health: 8, message: 'Hit a pothole! Health -8%' },
            { name: 'Traffic Jam', health: 0, message: 'Stuck in traffic!' }
        ];
        
        const disaster = disasters[Math.floor(Math.random() * disasters.length)];
        this.carHealth = Math.max(0, this.carHealth - disaster.health);
        
        document.getElementById('statusText').textContent = disaster.message;
        this.updateHealthDisplay();
        
        if (this.carHealth <= 0) {
            this.stopDriving();
            document.getElementById('statusText').textContent = 'Car destroyed! Game Over';
        }
    }
    
    trimOldRoute() {
        if (!this.routeLine || this.currentRouteIndex < 2) return;
        
        // Keep some segments ahead for visual continuity
        const keepIndex = Math.max(0, this.currentRouteIndex - 2);
        const remainingRoute = this.route.slice(keepIndex);
        
        if (remainingRoute.length > 1) {
            if (this.routeLine) {
                this.map.removeLayer(this.routeLine);
                if (this.routeLine.arrowDecorator) {
                    this.map.removeLayer(this.routeLine.arrowDecorator);
                }
            }
            
            const latlngs = remainingRoute.map(p => [p.lat, p.lng]);
            
            this.routeLine = L.polyline(latlngs, {
                color: '#0066ff',
                weight: 6,
                opacity: 0.9,
                dashArray: '15, 10',
                lineCap: 'round',
                lineJoin: 'round'
            }).addTo(this.map);
            
            // Add arrows for remaining route
            const arrowDecorator = L.polylineDecorator(this.routeLine, {
                patterns: [{
                    offset: '50%',
                    repeat: 200,
                    symbol: L.Symbol.arrowHead({
                        pixelSize: 15,
                        polygon: false,
                        pathOptions: {
                            stroke: true,
                            weight: 2,
                            color: '#ffffff'
                        }
                    })
                }]
            }).addTo(this.map);
            
            this.routeLine.arrowDecorator = arrowDecorator;
        }
    }
    
    calculateDistance(pos1, pos2) {
        const R = 6371; // Earth's radius in km
        const dLat = (pos2.lat - pos1.lat) * Math.PI / 180;
        const dLon = (pos2.lng - pos1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(pos1.lat * Math.PI / 180) * Math.cos(pos2.lat * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }
    
    async findCityCoordinates(cityName) {
        const cacheKey = cityName.toLowerCase();
        
        // Check cache first
        if (this.cityCache.has(cacheKey)) {
            const cached = this.cityCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.coordinates;
            }
        }
        
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}&limit=1&addressdetails=1`
            );
            const data = await response.json();
            
            if (data && data.length > 0) {
                const coordinates = {
                    lat: parseFloat(data[0].lat),
                    lng: parseFloat(data[0].lon)
                };
                
                // Cache the result
                this.cityCache.set(cacheKey, {
                    coordinates,
                    timestamp: Date.now()
                });
                
                return coordinates;
            }
        } catch (error) {
            console.error('City geocoding failed:', error);
            this.showError('City Geocoding Failed', error);
        }
        
        return null;
    }
    
    async teleportToCity(cityName) {
        if (!cityName.trim()) return;
        
        document.getElementById('statusText').textContent = 'Searching for city...';
        
        const coordinates = await this.findCityCoordinates(cityName);
        
        if (coordinates) {
            this.stopDriving();
            this.currentPosition = coordinates;
            this.updateCarPosition();
            this.map.setView([coordinates.lat, coordinates.lng], this.teleportZoom);
            this.updateLocationInfo(coordinates);
            
            // Clear destination and route
            if (this.destinationMarker) {
                this.map.removeLayer(this.destinationMarker);
                this.destinationMarker = null;
            }
            if (this.routeLine) {
                this.map.removeLayer(this.routeLine);
                if (this.routeLine.arrowDecorator) {
                    this.map.removeLayer(this.routeLine.arrowDecorator);
                }
                this.routeLine = null;
            }
            
            this.destination = null;
            this.route = [];
            
            document.getElementById('statusText').textContent = `Teleported to ${cityName} - Click anywhere to set destination`;
            document.getElementById('cityInput').value = '';
        } else {
            document.getElementById('statusText').textContent = `City "${cityName}" not found`;
        }
    }

    async updateLocationInfo(latlng) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latlng.lat}&lon=${latlng.lng}&addressdetails=1`);
            const data = await response.json();
            if (data && data.address) {
                this.currentCountry = data.address.country_code || 'us';
                const locationName = data.address.city || data.address.town || data.address.village || data.address.country.toUpperCase();
                document.getElementById('locationText').textContent = locationName;
            }
        } catch (error) {
            console.error("Failed to get location info:", error);
            document.getElementById('locationText').textContent = "Unknown";
            this.showError("Location API Failed", error);
        }
        await this.findNearbyFuelStations();
    }

    async findNearbyFuelStations() {
        this.fuelStationMarkers.forEach(marker => this.map.removeLayer(marker));
        this.fuelStationMarkers = [];
        this.nearbyFuelStations = [];

        const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];(node["amenity"="fuel"](around:${this.fuelStationSearchRadius},${this.currentPosition.lat},${this.currentPosition.lng}););out;`;

        try {
            const response = await fetch(overpassUrl);
            const data = await response.json();
            this.nearbyFuelStations = data.elements.map(el => ({ lat: el.lat, lng: el.lon, id: el.id }));
            this.displayFuelStations();
        } catch (error) {
            console.error("Failed to fetch fuel stations:", error);
            this.showError("Fuel Station API Failed", error);
        }
    }

    displayFuelStations() {
        const fuelIcon = L.icon({
            iconUrl: 'fuel-station.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });

        this.nearbyFuelStations.forEach(station => {
            const marker = L.marker([station.lat, station.lng], { icon: fuelIcon }).addTo(this.map);
            marker.on('click', () => this.handleRefueling(station));
            this.fuelStationMarkers.push(marker);
        });
    }

    startEmergencyRefuel() {
        if (this.nearbyFuelStations.length === 0) {
            document.getElementById('statusText').textContent = 'Low fuel, but no stations nearby!';
            return;
        }

        let closestStation = null;
        let minDistance = Infinity;

        this.nearbyFuelStations.forEach(station => {
            const distance = this.calculateDistance(this.currentPosition, station);
            if (distance < minDistance) {
                minDistance = distance;
                closestStation = station;
            }
        });

        if (closestStation) {
            this.isRefueling = true;
            this.originalDestination = this.destination;
            document.getElementById('statusText').textContent = 'Low fuel! Rerouting to nearest station...';
            this.setDestination({ lat: closestStation.lat, lng: closestStation.lng });
        }
    }

    handleRefueling() {
        this.stopDriving();
        const pricePerLiter = this.fuelPrices[this.currentCountry] || this.defaultFuelPrice;
        const fuelNeeded = this.maxFuel - this.fuel;
        const cost = fuelNeeded * pricePerLiter;

        const popupContent = `
            <div class="popup-content">
                <h4>Fuel Station</h4>
                <p>Price: ${pricePerLiter.toFixed(2)} / L (${this.currentCountry.toUpperCase()})</p>
                <p>Cost to full: ${cost.toFixed(2)}</p>
                <button id="refuelConfirmBtn" style="width:100%; padding: 8px; margin-top: 5px; background: #00ff88; border: none; border-radius: 5px; color: black; font-weight: bold; cursor: pointer;">Fill Tank</button>
            </div>
        `;

        const popup = L.popup()
            .setLatLng(this.currentPosition)
            .setContent(popupContent)
            .openOn(this.map);
        
        // Timeout to ensure button is in DOM
        setTimeout(() => {
            const refuelBtn = document.getElementById('refuelConfirmBtn');
            if (refuelBtn) {
                 refuelBtn.onclick = () => {
                    this.fuel = this.maxFuel;
                    this.updateFuelDisplay();
                    this.map.closePopup();
                    this.resumeOriginalRoute();
                };
            }
        }, 100);
    }
    
    resumeOriginalRoute() {
        this.isRefueling = false;
        if (this.originalDestination) {
            this.destination = this.originalDestination;
            this.originalDestination = null;
            document.getElementById('statusText').textContent = 'Refueled! Resuming original route...';
            this.calculateRoute();
        } else {
            document.getElementById('statusText').textContent = 'Refueled! Ready for new destination.';
        }
    }

    updateNavigationDisplay() {
        const navDisplay = document.getElementById('navigation-display');
        if (!this.isDriving || !this.routeSteps || this.routeSteps.length === 0) {
            navDisplay.classList.remove('visible');
            return;
        }
        navDisplay.classList.add('visible');

        const step = this.routeSteps[this.currentStepIndex];
        const nextStep = this.routeSteps[this.currentStepIndex + 1];

        const targetStep = nextStep || step;
        const location = { lat: targetStep.maneuver.location[1], lng: targetStep.maneuver.location[0] };
        const distance = this.calculateDistance(this.currentPosition, location) * 1000;

        document.getElementById('navDistance').textContent = distance > 1000 ? `${(distance/1000).toFixed(1)} km` : `${Math.round(distance)} m`;
        document.getElementById('navRoad').textContent = targetStep.name || 'Unnamed Road';

        let arrow = '↑';
        let instruction = targetStep.maneuver?.type || 'straight';
        if (targetStep.maneuver?.modifier) {
            instruction += `-${targetStep.maneuver.modifier}`;
        }
        
        switch (instruction) {
            case 'turn-left':
            case 'turn-slight left':
            case 'turn-sharp left': arrow = '↰'; break;
            case 'turn-right': 
            case 'turn-slight right':
            case 'turn-sharp right': arrow = '↱'; break;
            case 'roundabout-left': arrow = '↻'; break;
            case 'roundabout-right': arrow = '↻'; break;
            case 'depart': arrow = '↑'; break;
            case 'arrive': arrow = '🏁'; break;
            default: arrow = '↑';
        }
        document.getElementById('navIcon').textContent = arrow;
    }

    showError(title, error) {
        if (LOG_ERRORS_TO_CONSOLE) {
            console.error(`[AI Driver] ${title}:`, error);
        }
        
        if (!SHOW_ERROR_POPUPS) return;
        
        const modal = document.getElementById('errorModal');
        document.getElementById('errorTitle').textContent = title;
        document.getElementById('errorDetails').textContent = error.stack ? `${error.message}\n\n${error.stack}` : error;
        modal.style.display = 'flex';
    }
    
    initRealisticFeatures() {
        this.setupWeatherSystem();
        this.setupDayNightCycle();
        this.setupTrafficSimulation();
        this.setupEngineSounds();
        this.setupSpeedLimits();
        this.startRealisticUpdates();
        this.spawnCarAdditions();
    }
    
    setupWeatherSystem() {
        if (!ENABLE_WEATHER) return;
        
        // Weather effects on map
        this.weatherOverlay = L.layerGroup().addTo(this.map);
        
        // Update weather periodically
        setInterval(() => {
            this.updateWeather();
        }, WEATHER_UPDATE_INTERVAL);
    }
    
    updateWeather() {
        const weatherTypes = ['clear', 'rain', 'fog', 'storm'];
        const weatherChances = [0.4, 0.3, 0.2, 0.1];
        
        const random = Math.random();
        let cumulative = 0;
        
        for (let i = 0; i < weatherTypes.length; i++) {
            cumulative += weatherChances[i];
            if (random < cumulative) {
                this.weather.type = weatherTypes[i];
                break;
            }
        }
        
        // Update weather parameters
        switch (this.weather.type) {
            case 'clear':
                this.weather.visibility = 1.0;
                this.weather.rainIntensity = 0;
                this.weather.temperature = 20 + Math.random() * 10;
                break;
            case 'rain':
                this.weather.visibility = 0.7;
                this.weather.rainIntensity = 0.3 + Math.random() * 0.4;
                this.weather.temperature = 15 + Math.random() * 5;
                break;
            case 'fog':
                this.weather.visibility = 0.3 + Math.random() * 0.3;
                this.weather.rainIntensity = 0;
                this.weather.temperature = 10 + Math.random() * 5;
                break;
            case 'storm':
                this.weather.visibility = 0.4;
                this.weather.rainIntensity = 0.7 + Math.random() * 0.3;
                this.weather.temperature = 5 + Math.random() * 10;
                break;
        }
        
        // Apply weather effects
        this.applyWeatherEffects();
    }
    
    applyWeatherEffects() {
        // Remove existing weather overlay
        this.weatherOverlay.clearLayers();
        
        // Add weather visual effects
        if (this.weather.rainIntensity > 0) {
            // Add rain particles effect (CSS overlay)
            const rainOverlay = L.divIcon({
                html: `<div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; 
                       background: linear-gradient(transparent, rgba(100,149,237,${this.weather.rainIntensity * 0.1})); 
                       pointer-events: none; z-index: 999;"></div>`,
                iconSize: [0, 0],
                className: 'weather-overlay'
            });
            
            L.marker([0, 0], { icon: rainOverlay }).addTo(this.weatherOverlay);
        }
        
        // Update visibility
        if (this.weather.visibility < 1.0) {
            this.map.getContainer().style.filter = `brightness(${0.8 + this.weather.visibility * 0.2})`;
        }
        
        // Update AI behavior based on weather
        this.adjustAIToWeather();
    }
    
    adjustAIToWeather() {
        // Reduce speed in bad weather
        const weatherModifier = this.weather.visibility * (1 - this.weather.rainIntensity * 0.3);
        this.targetSpeed = Math.min(this.speed, this.speed * weatherModifier);
        
        // Increase disaster chance in bad weather
        if (this.disastersEnabled && this.weather.rainIntensity > 0.5) {
            // Higher chance of accidents in rain
        }
    }
    
    setupDayNightCycle() {
        if (!ENABLE_DAY_NIGHT) return;
        
        // Start day/night cycle
        setInterval(() => {
            this.timeOfDay = (this.timeOfDay + (24 / (DAY_NIGHT_DURATION * 60))) % 24;
            this.updateDayNightCycle();
        }, 1000);
    }
    
    updateDayNightCycle() {
        const isNight = this.timeOfDay < 6 || this.timeOfDay > 18;
        const brightness = isNight ? 0.3 : 1.0;
        
        // Update map brightness
        this.map.getContainer().style.filter = `brightness(${brightness})`;
        
        // Update tile layer for night mode
        if (isNight) {
            // Switch to dark tile layer
            this.map.removeLayer(this.map._layers[Object.keys(this.map._layers)[0]]);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors © CARTO'
            }).addTo(this.map);
        } else {
            // Switch back to normal
            this.map.removeLayer(this.map._layers[Object.keys(this.map._layers)[0]]);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(this.map);
        }
    }
    
    setupTrafficSimulation() {
        if (!ENABLE_TRAFFIC) return;
        
        // Add traffic vehicles
        this.trafficVehicles = [];
        
        // Update traffic positions
        setInterval(() => {
            this.updateTraffic();
        }, 2000);
    }
    
    updateTraffic() {
        // Simulate traffic flow
        const trafficCount = Math.floor(TRAFFIC_DENSITY * 10);
        
        // Remove old traffic
        this.trafficVehicles.forEach(vehicle => {
            if (vehicle.marker) this.map.removeLayer(vehicle.marker);
        });
        this.trafficVehicles = [];
        
        // Add new traffic
        for (let i = 0; i < trafficCount; i++) {
            const lat = this.currentPosition.lat + (Math.random() - 0.5) * 0.02;
            const lng = this.currentPosition.lng + (Math.random() - 0.5) * 0.02;
            
            const vehicleIcon = L.divIcon({
                html: '<div style="background: #ff9800; width: 8px; height: 8px; border-radius: 50%; border: 1px solid white;"></div>',
                iconSize: [8, 8],
                className: 'traffic-vehicle'
            });
            
            const marker = L.marker([lat, lng], { icon: vehicleIcon })
                .addTo(this.map);
            
            this.trafficVehicles.push({ marker, position: { lat, lng } });
        }
    }
    
    async setupEngineSounds() {
        if (!ENABLE_ENGINE_SOUNDS) return;
        
        // Create engine sound loop
        this.engineSound = await this.createEngineSound();
    }
    
    async createEngineSound() {
        // Create engine sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        gainNode.gain.setValueAtTime(ENGINE_VOLUME, audioContext.currentTime);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        return { oscillator, gainNode, audioContext };
    }
    
    updateEngineSound() {
        if (!this.engineSound || !ENABLE_ENGINE_SOUNDS) return;
        
        const rpm = 200 + (this.actualSpeed / this.speed) * 800;
        this.engineSound.oscillator.frequency.setValueAtTime(rpm, this.engineSound.audioContext.currentTime);
    }
    
    async setupSpeedLimits() {
        if (!ENABLE_SPEED_LIMITS) return;
        
        // Fetch speed limits from OSM
        const response = await fetch(
            `https://overpass-api.de/api/interpreter?data=[out:json];way(around:1000,${this.currentPosition.lat},${this.currentPosition.lng})["maxspeed"];out;`
        );
        
        if (response.ok) {
            const data = await response.json();
            data.elements.forEach(element => {
                if (element.tags && element.tags.maxspeed) {
                    this.speedLimits.set(element.id, parseInt(element.tags.maxspeed));
                }
            });
        }
    }
    
    checkSpeedLimit() {
        if (!ENABLE_SPEED_LIMITS || this.speedLimitBypassMode) return;
        
        // Get current road speed limit
        const currentSpeedLimit = this.getCurrentSpeedLimit();
        
        if (currentSpeedLimit && this.actualSpeed > currentSpeedLimit + SPEED_LIMIT_TOLERANCE) {
            // Speed violation
            this.triggerSpeedingEvent();
        }
    }
    
    getCurrentSpeedLimit() {
        /* @tweakable default speed limit when no specific limit is found */
        const DEFAULT_SPEED_LIMIT = 50;
        /* @tweakable speed limit for urban areas */
        const URBAN_SPEED_LIMIT = 50;
        /* @tweakable speed limit for residential areas */
        const RESIDENTIAL_SPEED_LIMIT = 30;
        /* @tweakable speed limit for highways */
        const HIGHWAY_SPEED_LIMIT = 100;
        
        // For now, return default based on driving style
        switch (this.drivingStyle) {
            case 'aggressive':
                return HIGHWAY_SPEED_LIMIT;
            case 'cautious':
                return RESIDENTIAL_SPEED_LIMIT;
            default:
                return DEFAULT_SPEED_LIMIT;
        }
    }
    
    triggerSpeedingEvent() {
        if (Math.random() < 0.1) {
            document.getElementById('statusText').textContent = 'Speeding detected! Police might be nearby...';
        }
    }
    
    startRealisticUpdates() {
        // Update realistic physics
        setInterval(() => {
            this.updateRealisticPhysics();
        }, 100);
    }
    
    updateRealisticPhysics() {
        // Update fuel consumption based on driving style
        let consumptionMultiplier = 1.0;
        
        switch (this.drivingStyle) {
            case 'aggressive':
                consumptionMultiplier = 1.5;
                break;
            case 'cautious':
                consumptionMultiplier = 0.8;
                break;
            case 'drunk':
                consumptionMultiplier = 1.2;
                break;
        }
        
        this.actualFuelConsumption = FUEL_CONSUMPTION_RATE * consumptionMultiplier;
        
        // Update tire wear
        if (ENABLE_TIRE_WEAR) {
            const wearRate = (this.actualSpeed / 100) * TIRE_WEAR_RATE * 0.01;
            this.tireCondition = Math.max(0, this.tireCondition - wearRate);
            
            if (this.tireCondition < 20) {
                document.getElementById('statusText').textContent = 'Warning: Low tire condition!';
            }
        }
        
        // Update engine sound
        this.updateEngineSound();
        
        // Check speed limits
        this.checkSpeedLimit();
        
        // Check for car additions collisions
        this.checkCarAdditionsCollision();
    }

    async spawnCarAdditions() {
        const additions = [
            'traffic-cone', 'speed-bump', 'road-block', 'construction-sign',
            'police-car', 'ambulance', 'fire-truck', 'towing-truck'
        ];
        
        for (let i = 0; i < 5; i++) {
            const type = additions[Math.floor(Math.random() * additions.length)];
            const lat = this.currentPosition.lat + (Math.random() - 0.5) * CAR_ADDITIONS_RADIUS / 111000;
            const lng = this.currentPosition.lng + (Math.random() - 0.5) * CAR_ADDITIONS_RADIUS / 111000 / Math.cos(this.currentPosition.lat * Math.PI / 180);
            
            await this.createCarAddition(type, lat, lng);
        }
    }

    async createCarAddition(type, lat, lng) {
        const icons = {
            'traffic-cone': '🚧',
            'speed-bump': '⚠️',
            'road-block': '🚫',
            'construction-sign': '🚧',
            'police-car': '👮',
            'ambulance': '🚑',
            'fire-truck': '🚒',
            'towing-truck': '🚛'
        };
        
        const icon = L.divIcon({
            html: `<div style="font-size: 24px; transform: translate(-50%, -50%);">${icons[type] || '🚧'}</div>`,
            iconSize: [30, 30],
            className: 'car-addition-icon'
        });
        
        const marker = L.marker([lat, lng], { icon }).addTo(this.map);
        marker.bindPopup(`<b>${type.replace('-', ' ').toUpperCase()}</b>`);
        
        this.carAdditions.push({ marker, type, lat, lng });
    }

    checkCarAdditionsCollision() {
        this.carAdditions.forEach(addition => {
            const distance = this.calculateDistance(this.currentPosition, addition);
            if (distance < 0.001) { // 1 meter threshold
                this.handleCarAdditionCollision(addition.type);
            }
        });
    }

    handleCarAdditionCollision(type) {
        const effects = {
            'traffic-cone': () => this.carHealth -= 2,
            'speed-bump': () => this.actualSpeed = Math.max(10, this.actualSpeed - 20),
            'road-block': () => this.stopDriving(),
            'construction-sign': () => this.carHealth -= 1,
            'police-car': () => this.triggerPoliceEvent(),
            'ambulance': () => this.carHealth -= 3,
            'fire-truck': () => this.carHealth -= 4,
            'towing-truck': () => this.carHealth -= 5
        };
        
        if (effects[type]) {
            effects[type]();
            document.getElementById('statusText').textContent = `Hit ${type.replace('-', ' ')}!`;
        }
    }

    triggerPoliceEvent() {
        if (this.speedLimitBypassMode && this.actualSpeed > 80) {
            document.getElementById('statusText').textContent = 'Police chase initiated!';
            this.carHealth -= 10;
        }
    }

    updateSpeedLimitStatus() {
        const statusElement = document.getElementById('statusText');
        if (this.speedLimitBypassMode) {
            statusElement.textContent = 'Speed limit bypass enabled - Drive at any speed!';
            statusElement.style.color = '#ff4444';
        } else {
            statusElement.style.color = 'white';
            if (!this.isDriving) {
                statusElement.textContent = 'Ready - Click anywhere to set destination';
            } else {
                const currentLimit = this.getCurrentSpeedLimit();
                if (currentLimit) {
                    statusElement.textContent = `Speed limit: ${currentLimit} km/h`;
                }
            }
        }
    }
}

/* WebSocket ping client for sending periodic GPS pings to the ingestion endpoint.
   Uses tweakable WS_PING_INTERVAL_MS and WS_VEHICLE_ID constants above. */
/* @tweakable toggle for websocket ping client initialization (keeps the method attached to the app prototype) */
AIDriverApp.prototype.initWebSocket = function() {
    try {
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const url = `${protocol}://${window.location.host.replace(/:\d+$/, ':8080')}/ws`;
        // If running from a different host or port, fallback to same-origin /ws
        this.ws = new WebSocket(url);
    } catch (e) {
        // fallback: try relative path
        this.ws = new WebSocket('/ws');
    }

    this.ws.addEventListener('open', () => {
        console.log('[AI Driver] WebSocket connected for pings');
        this.startPinging();
    });

    this.ws.addEventListener('close', () => {
        console.log('[AI Driver] WebSocket closed');
        this.stopPinging();
        // attempt reconnect after a delay
        setTimeout(() => this.initWebSocket(), 2000);
    });

    this.ws.addEventListener('error', (err) => {
        console.error('[AI Driver] WebSocket error:', err);
    });

    this.ws.addEventListener('message', (evt) => {
        // Optionally handle server messages
        // console.log('WS msg', evt.data);
    });
};

/* @tweakable toggle websocket pinging (set false to disable automatic pings) */
AIDriverApp.prototype.startPinging = function() {
    if (this._pingIntervalHandle) return;
    this._pingIntervalHandle = setInterval(() => {
        this.sendPing();
    }, WS_PING_INTERVAL_MS);
};

/* @tweakable stop websocket pinging */
AIDriverApp.prototype.stopPinging = function() {
    if (this._pingIntervalHandle) {
        clearInterval(this._pingIntervalHandle);
        this._pingIntervalHandle = null;
    }
};

/* @tweakable send a single websocket GPS ping (used by the ping timer) */
AIDriverApp.prototype.sendPing = function() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const ping = {
        vehicle_id: WS_VEHICLE_ID,
        lat: this.currentPosition.lat,
        lng: this.currentPosition.lng,
        speed_kph: Math.round(this.actualSpeed || 0),
        timestamp: Date.now()
    };

    try {
        this.ws.send(JSON.stringify(ping));
    } catch (e) {
        console.error('[AI Driver] Failed to send ping:', e);
    }
};

// Add realistic CSS effects
const style = document.createElement('style');
style.textContent = `
    .weather-overlay {
        pointer-events: none !important;
    }
    
    .traffic-vehicle {
        transition: all 2s ease-in-out;
    }
    
    #map {
        transition: filter 0.5s ease-in-out;
    }
    
    .controls {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);

/* @tweakable target render FPS for throttled RAF updates (decouples ingestion from render) */
const RENDER_FPS = 30;

/* Throttled RAF helper: batches incoming data and runs updates at a capped framerate.
   Useful when decoupling high-frequency telemetry from DOM/WebGL updates. */
class ThrottledRAF {
    constructor(callback, targetFps = RENDER_FPS) {
        this.callback = callback;
        this.interval = 1000 / targetFps;
        this.lastTime = 0;
        this.isRunning = false;
        this.pendingData = null;
    }

    /* @tweakable whether the raf should start automatically on first update */
    update(data) {
        this.pendingData = data;
        if (!this.isRunning) {
            this.isRunning = true;
            this.loop();
        }
    }

    loop() {
        if (!this.isRunning) return;
        const now = performance.now();
        const elapsed = now - this.lastTime;

        if (elapsed >= this.interval && this.pendingData !== null) {
            try {
                this.callback(this.pendingData);
            } catch (e) {
                console.error('ThrottledRAF callback error:', e);
            }
            this.pendingData = null; // Clear after processing
            this.lastTime = now - (elapsed % this.interval); // Prevent drift
        }

        requestAnimationFrame(() => this.loop());
    }

    stop() {
        this.isRunning = false;
    }
}

// Example usage: connect a throttled updater to a map source if/when you add MapLibre.
// This is a safe no-op for the current Leaflet-based app but provides a ready hook
// for high-frequency driver telemetry updates (see Part 2 of the engineering notes).
const mapUpdater = new ThrottledRAF((newDriverData) => {
    // If you migrate to MapLibre, call: map.getSource('drivers').setData(newDriverData);
    // For now we just log a lightweight summary to avoid heavy map updates every tick.
    if (newDriverData && newDriverData.features) {
        // keep logs minimal to avoid noisy console on high-throughput runs
        console.log(`[ThrottledRAF] received ${newDriverData.features.length} features (throttled render)`);
    }
}, RENDER_FPS);

// Initialize the app
const app = new AIDriverApp();

// Add polyline decorator plugin
const polylineDecoratorScript = document.createElement('script');
polylineDecoratorScript.src = 'https://cdn.jsdelivr.net/npm/leaflet-polylinedecorator@1.6.0/dist/leaflet.polylineDecorator.min.js';
document.head.appendChild(polylineDecoratorScript);