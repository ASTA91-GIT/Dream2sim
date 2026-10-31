# Dream2Sim Traffic Simulation Engine

Dream2Sim features a deterministic microscopic traffic simulation engine written in pure Python.

## Kinematics: Intelligent Driver Model (IDM)

Vehicles accelerate and decelerate according to the Intelligent Driver Model:

$$\frac{dv}{dt} = a \left[ 1 - \left(\frac{v}{v_0}\right)^4 - \left(\frac{s^*(v, \Delta v)}{s}\right)^2 \right]$$

Where:
- $v$: current velocity
- $v_0$: desired free-flow velocity (road speed limit or vehicle maximum speed)
- $a$: maximum acceleration
- $s$: net distance headway to the leading vehicle: $s = x_{\text{lead}} - x_{\text{veh}} - L_{\text{lead}}$
- $s^*(v, \Delta v)$: effective desired minimum gap:

$$s^*(v, \Delta v) = s_0 + \max\left(0, v \cdot T + \frac{v \cdot \Delta v}{2 \sqrt{a \cdot b}}\right)$$

- $s_0$: minimum jam distance (m)
- $T$: safe time headway (s)
- $b$: comfortable deceleration rate (m/s²)
- $\Delta v = v - v_{\text{lead}}$: relative approaching speed

## Signal Control & Stop Line Obstacles

Traffic lights act as virtual stationary obstacles ($v_{\text{lead}} = 0$) located at the intersection stop line when the active phase is `RED` or `YELLOW`.

## Numerical Metric Calculations

1. **Average Waiting Time**: Cumulative time each vehicle spends with $v < 1.0\text{ m/s}$ divided by total vehicles generated.
2. **System Throughput**: Completed trips scaled to Vehicles Per Hour:
   $$\text{Throughput} = \frac{\text{Completed Vehicles}}{\text{Duration (seconds)}} \times 3600$$
3. **Queue Length**: Instantaneous count of vehicles with speed $< 1.0\text{ m/s}$. Both average and maximum peak are computed.
4. **Signal Efficiency Score**: Rated from 10 to 100 based on stop delays and queue clearance rates.
