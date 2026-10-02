/* ...existing code ... */
    makeAIDecision() {
        // Weather effects
        const weatherModifier = this.weather.visibility * (1 - this.weather.rainIntensity * 0.3);
        
        // Tire condition effects
        const tireModifier = this.tireCondition / 100;
        
        // Combined modifier
        const combinedModifier = weatherModifier * tireModifier;
        
-        // Apply to target speed
-        this.targetSpeed = Math.min(this.speed, this.speed * combinedModifier);
+        // Apply to target speed (normal)
+        this.targetSpeed = Math.min(this.speed, this.speed * combinedModifier);
+
+        // Super Aggressive mode overrides & multipliers
+        if (this.drivingStyle === 'super-aggressive') {
+            // Increase base target speed aggressively
+            this.targetSpeed = Math.min(this.maxSpeed, this.targetSpeed * SUPER_AGGRESSIVE_SPEED_MULTIPLIER);
+            // Increase disaster chance while driving extremely fast
+            if (this.disastersEnabled && Math.random() < (DISASTER_CHANCE * SUPER_AGGRESSIVE_DISASTER_MULTIPLIER)) {
+                this.triggerDisaster();
+            }
+        }
        
        if (this.instantAcceleration) {
            this.actualSpeed = this.targetSpeed;
            return;
        }
        
        // Original driving style logic
-        if (this.actualSpeed < this.targetSpeed) {
-            this.actualSpeed = Math.min(
-                this.targetSpeed,
-                this.actualSpeed + ACCELERATION_RATE * (AI_REACTION_TIME / 1000)
-            );
-        } else {
-            this.actualSpeed = Math.max(
-                0,
-                this.actualSpeed - DECELERATION_RATE * (AI_REACTION_TIME / 1000)
-            );
-        }
+        // Apply accelerated acceleration for Super Aggressive mode
+        const accelRate = (this.drivingStyle === 'super-aggressive') ? ACCELERATION_RATE * SUPER_AGGRESSIVE_ACCELERATION_MULTIPLIER : ACCELERATION_RATE;
+        const decelRate = (this.drivingStyle === 'super-aggressive') ? Math.max(DECELERATION_RATE * 0.8, 5) : DECELERATION_RATE;
+
+        if (this.actualSpeed < this.targetSpeed) {
+            this.actualSpeed = Math.min(
+                this.targetSpeed,
+                this.actualSpeed + accelRate * (AI_REACTION_TIME / 1000)
+            );
+        } else {
+            this.actualSpeed = Math.max(
+                0,
+                this.actualSpeed - decelRate * (AI_REACTION_TIME / 1000)
+            );
+        }
    }
/* ...existing code ... */

/* ...existing code ... */
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
+            case 'super-aggressive':
+                consumptionMultiplier = 1.5 * SUPER_AGGRESSIVE_FUEL_MULTIPLIER;
+                break;
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
/* ...existing code ... */
    }
/* ...existing code ... */

