/**
 * LVS Shared Tabs Module
 * =======================
 * Single source of truth for Product, Specs, DevKit, SDK, and other shared tab content.
 * Update specs here and all portals (customer, investor, founder) will reflect changes.
 *
 * Last Updated: February 2026
 * Version: 1.0
 */

const LVSSharedTabs = {
    // ==========================================================================
    // TECHNICAL SPECIFICATIONS (Update these values as specs change)
    // ==========================================================================
    specs: {
        // Process & Architecture
        processNode: "GlobalFoundries 12LP+ (12nm FinFET)",
        packageSize: "35 x 35 x 3.2mm BGA",
        chipletCount: "5-Chiplet UCIe 2.0",
        interconnectBandwidth: "672 GB/s aggregate",

        // Compute Performance
        npuPerformance: "~230 TOPS (INT8) / ~115 TFLOPS (FP16)",
        npuArchitecture: "Dual NPU with 64K MAC Array each",
        combinedTops: "~230 TOPS",
        powerEfficiency: "~30 TOPS/W",

        // CPU Complex
        cpuCores: "8-core ARM Cortex-A78AE @ 2.0GHz",
        riscvCores: "RISC-V real-time cores for deterministic autonomy tasks",
        autonomyStack: "Linux-based OS of choice on RISC-V for deterministic control",
        vdsp: "Quad-core Vector DSP",

        // Memory System
        mainMemory: "LPDDR5 up to 32GB @ 102.4 GB/s",
        persistentStorage: "Integrated MRAM Chiplet (non-volatile)",

        // Power Specifications
        tdpTypical: "<25W",
        tdpMaximum: "35W",
        nominalWorkload: "17-22W (ROS2 + 2 AI models)",

        // Power Budget Breakdown
        powerBreakdown: {
            cpu: { typical: "8-12W", peak: "14-18W", notes: "ARM A78AE + RISC-V cores" },
            npu: { typical: "6-8W", peak: "10-12W", notes: "Dual NPU @ ~30 TOPS/W" },
            memory: { typical: "1-2W", peak: "3W", notes: "LPDDR5 PHY + Controller" },
            vdsp: { typical: "1-2W", peak: "3W", notes: "Quad-core Vector DSP" },
            rf: { typical: "0.2-0.5W", peak: "1W", notes: "Wideband SDR + LPI/LPD" },
            security: { typical: "0.5-1W", peak: "1.5W", notes: "tRoot HSM + PQC crypto" },
            interconnect: { typical: "1-2W", peak: "3W", notes: "UCIe 2.0 fabric" },
            misc: { typical: "0.5W", peak: "1W", notes: "MRAM + peripherals" }
        },

        // I/O & Interfaces
        pcie: "Gen5 x8 (host) / Gen6 & CXL 3.0 compatible",
        cameraInterfaces: "8x MIPI CSI-2 (4-lane each)",
        usb: "USB4",
        rf: "Wideband RF modem, multi-band SDR, SATCOM ready",
        rfCovert: "LPI/LPD covert communications support",
        debug: "JTAG, UART console",

        // Operating Conditions
        tempRange: "-40°C to +105°C",
        latency: "<10ms sensor-to-decision",
        videoProcessing: "4K @ 60fps + 250 TOPS simultaneous",

        // Security
        security: "tRoot HSM with secure boot, crypto acceleration",
        encryption: "Post-quantum encryption (PQC) ready",

        // Fleet Intelligence
        fleetIntel: "Multi-platform coordination & distributed sensor fusion",
        meshNetwork: "Ad-hoc mesh networking for swarm operations",
        collaborativeAI: "Edge-to-edge AI model sharing & collaborative inference",

        // Timeline
        productionTarget: "Q3 2027"
    },

    // ==========================================================================
    // CHIPLET ARCHITECTURE
    // ==========================================================================
    chiplets: [
        { name: "Neural Compute Chiplet", components: "NPU + ARM + RISC-V + VDSP", color: "#7c4dff" },
        { name: "Secure Interface Chiplet", components: "tRoot HSM + PQC encryption", color: "#10b981" },
        { name: "RF Modem Chiplet", components: "Wideband SDR, LPI/LPD, SATCOM", color: "#f59e0b" },
        { name: "Beamformer Chiplet", components: "RF processing, EW support", color: "#06b6d4" },
        { name: "MRAM Chiplet", components: "Non-volatile storage", color: "#ec4899" }
    ],

    // ==========================================================================
    // GENERATE TAB CONTENT
    // ==========================================================================

    /**
     * Generate Product Overview Tab HTML
     */
    getProductTab() {
        return `
            <!-- Hero Video -->
            <div class="hero-video-container" style="position: relative; width: 100%; max-height: 400px; overflow: hidden; border-radius: 16px; margin-bottom: 24px;">
                <video id="heroVideo" class="hero-video" autoplay muted loop playsinline style="width: 100%; display: block; object-fit: cover;">
                    <source src="assets/lvs-chiplet-hero.mp4" type="video/mp4">
                </video>
                <div class="video-controls" style="position: absolute; bottom: 16px; right: 16px;">
                    <button id="muteBtn" class="video-btn muted" title="Unmute" style="background: rgba(0,0,0,0.6); border: none; color: white; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 16px;">
                        &#128263;
                    </button>
                </div>
                <div class="video-overlay" style="position: absolute; bottom: 0; left: 0; right: 0; padding: 24px; background: linear-gradient(transparent, rgba(0,0,0,0.8));">
                    <h2 style="font-size: 32px; font-weight: 800; margin-bottom: 4px;">LVS-250</h2>
                    <p style="font-size: 16px; color: var(--muted);">Next-Generation Neural Compute Engine</p>
                </div>
            </div>

            <!-- Executive Summary -->
            <div class="exec-summary" style="background: var(--panel); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px; margin-bottom: 20px;">
                    <div>
                        <div style="font-size: 24px; font-weight: 800; color: var(--accent);">LVS-250</div>
                        <div style="font-size: 14px; color: var(--muted);">Production Neural Compute Engine for Defense & Aerospace</div>
                    </div>
                    <div style="display: flex; gap: 8px;">
                        <span style="background: rgba(124,77,255,0.2); color: var(--accent); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">GF 12LP+</span>
                        <span style="background: rgba(212,175,55,0.2); color: var(--gold); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">Production 2027</span>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div style="text-align: center;">
                        <div style="font-size: 28px; font-weight: 800; color: var(--accent);">~230</div>
                        <div style="font-size: 12px; color: var(--muted);">TOPS Performance</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 28px; font-weight: 800; color: var(--gold);">35x35</div>
                        <div style="font-size: 12px; color: var(--muted);">Package (mm)</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 28px; font-weight: 800; color: var(--success);">5</div>
                        <div style="font-size: 12px; color: var(--muted);">UCIe 2.0 Chiplets</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 28px; font-weight: 800; color: #06b6d4;"><25W</div>
                        <div style="font-size: 12px; color: var(--muted);">TDP Target</div>
                    </div>
                </div>

                <p style="font-size: 14px; color: var(--muted); line-height: 1.7; margin-bottom: 20px;">
                    The LVS-250 is a production-grade neural compute engine designed for edge AI inference in defense and aerospace applications.
                    Featuring a 5-chiplet UCIe 2.0 architecture with integrated LPDDR5 memory, the LVS-250 delivers ~230 TOPS of inference
                    performance in a compact 35x35mm package. Autonomy stacks run on Linux-based OS of choice on RISC-V cores for deterministic
                    real-time control. Integrated wideband RF modem supports LPI/LPD covert communications with post-quantum encryption.
                    Purpose-built for ISR, C-UAS, and autonomous systems requiring real-time perception and decision-making at the tactical edge.
                </p>

                <!-- SDK Value Proposition -->
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.05)); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 8px; padding: 16px;">
                        <div style="font-size: 13px; font-weight: 600; color: #3b82f6; margin-bottom: 8px;">&#9889; Hardware + Software Platform</div>
                        <div style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
                            The LVS SDK enables <strong style="color: #e2e8f0;">write-once, deploy-anywhere</strong> development.
                            Code written for prototyping on CPU/GPU deploys directly to LVS-250 without modification.
                        </div>
                    </div>
                    <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05)); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; padding: 16px;">
                        <div style="font-size: 13px; font-weight: 600; color: #10b981; margin-bottom: 8px;">&#128187; 60% Less Code</div>
                        <div style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
                            Model-optimized APIs for YOLO, OpenPose, and segmentation handle all pre/post-processing.
                            Focus on your application logic, not image manipulation.
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Specs Summary -->
            <div class="panel">
                <h3>Key Specifications</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 12px 0; color: var(--muted);">Performance</td>
                        <td style="padding: 12px 0; font-weight: 600;">~230 TOPS (INT8), ~115 TFLOPS (FP16)</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 12px 0; color: var(--muted);">Architecture</td>
                        <td style="padding: 12px 0; font-weight: 600;">5-Chiplet UCIe 2.0 (Neural + Secure + RF + Beam + MRAM)</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 12px 0; color: var(--muted);">Compute</td>
                        <td style="padding: 12px 0; font-weight: 600;">64K MAC NPU + ARM A78AE + RISC-V RT + Quad-core VDSP</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 12px 0; color: var(--muted);">Autonomy</td>
                        <td style="padding: 12px 0; font-weight: 600;">Linux-based OS on RISC-V for deterministic control</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 12px 0; color: var(--muted);">Memory</td>
                        <td style="padding: 12px 0; font-weight: 600;">LPDDR5 up to 32GB @ 102.4 GB/s</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 12px 0; color: var(--muted);">RF Modem</td>
                        <td style="padding: 12px 0; font-weight: 600;">Wideband SDR, LPI/LPD covert comms, SATCOM</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 12px 0; color: var(--muted);">Package</td>
                        <td style="padding: 12px 0; font-weight: 600;">35 x 35mm BGA, <25W TDP</td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; color: var(--muted);">Security</td>
                        <td style="padding: 12px 0; font-weight: 600;">tRoot HSM, secure boot, post-quantum encryption</td>
                    </tr>
                </table>
            </div>

            <!-- Chiplet Architecture -->
            <div class="panel" style="margin-top: 24px;">
                <h3>5-Chiplet UCIe 2.0 Architecture</h3>
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-top: 16px;">
                    ${this.chiplets.map(c => `
                        <div style="background: ${c.color}20; border: 1px solid ${c.color}40; padding: 16px; border-radius: 10px; text-align: center;">
                            <div style="font-size: 13px; font-weight: 600; color: ${c.color}; margin-bottom: 6px;">${c.name}</div>
                            <div style="font-size: 11px; color: var(--muted);">${c.components}</div>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top: 16px; padding: 12px 16px; background: rgba(255,255,255,0.03); border-radius: 8px; text-align: center;">
                    <span style="font-size: 12px; color: var(--muted);">UCIe 2.0 Interconnect: </span>
                    <span style="font-size: 12px; font-weight: 600; color: var(--accent);">${this.specs.interconnectBandwidth}</span>
                </div>
            </div>

            <!-- Demo Video Section -->
            <div class="panel" style="margin-top: 24px;">
                <h3 style="margin-bottom: 16px;">LVS-250 in Action</h3>

                <!-- Performance Stats Banner -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; padding: 16px; background: linear-gradient(135deg, rgba(124,77,255,0.1), rgba(16,185,129,0.1)); border-radius: 12px; border: 1px solid rgba(124,77,255,0.2);">
                    <div style="text-align: center;">
                        <div style="font-size: 22px; font-weight: 800; color: var(--accent);">~230</div>
                        <div style="font-size: 11px; color: var(--muted);">TOPS</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 22px; font-weight: 800; color: var(--success);">25-30W</div>
                        <div style="font-size: 11px; color: var(--muted);">Power Draw</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 22px; font-weight: 800; color: var(--gold);">3+</div>
                        <div style="font-size: 11px; color: var(--muted);">AI Models</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 22px; font-weight: 800; color: #06b6d4;">Real-Time</div>
                        <div style="font-size: 11px; color: var(--muted);">Inference</div>
                    </div>
                </div>
                <p style="font-size: 13px; color: var(--muted); margin-bottom: 16px; line-height: 1.6;">
                    Running <strong style="color: var(--text);">multiple AI vision models simultaneously</strong>—object detection, tracking, and classification—while maintaining real-time performance at ~25-30W. The LVS-250 delivers edge AI inference at unprecedented efficiency.
                </p>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
                    <div style="background: var(--panel-light); border-radius: 12px; overflow: hidden;">
                        <video class="demo-video" autoplay muted loop playsinline style="width: 100%; display: block; aspect-ratio: 16/9; object-fit: cover;">
                            <source src="assets/demos/demo-1.mp4" type="video/mp4">
                        </video>
                        <div style="padding: 12px 16px;">
                            <div style="font-size: 14px; font-weight: 600;">Visible Spectrum Analysis</div>
                            <div style="font-size: 12px; color: var(--muted); margin-top: 4px;">High-accuracy object detection and tracking in daylight conditions</div>
                        </div>
                    </div>
                    <div style="background: var(--panel-light); border-radius: 12px; overflow: hidden;">
                        <video class="demo-video" autoplay muted loop playsinline style="width: 100%; display: block; aspect-ratio: 16/9; object-fit: cover;">
                            <source src="assets/demos/demo-2.mp4" type="video/mp4">
                        </video>
                        <div style="padding: 12px 16px;">
                            <div style="font-size: 14px; font-weight: 600;">Low-Light &amp; IR Analysis</div>
                            <div style="font-size: 12px; color: var(--muted); margin-top: 4px;">Thermal and infrared detection for 24/7 operational capability</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Fleet Intelligence Section -->
            <div class="panel" style="margin-top: 24px; border-left: 3px solid #06b6d4;">
                <h3 style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 24px;">&#127760;</span>
                    Fleet Intelligence
                </h3>
                <p style="color: var(--muted); margin: 12px 0 20px 0; font-size: 14px; line-height: 1.6;">
                    The LVS-250 is designed for coordinated multi-platform operations. Each node operates autonomously while contributing to shared fleet awareness—enabling swarm coordination, distributed sensor fusion, and collaborative decision-making across air, ground, and maritime assets.
                </p>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div style="background: linear-gradient(135deg, rgba(6,182,212,0.15), rgba(6,182,212,0.05)); border: 1px solid rgba(6,182,212,0.3); border-radius: 12px; padding: 20px; text-align: center;">
                        <div style="font-size: 32px; margin-bottom: 8px;">&#128225;</div>
                        <div style="font-size: 14px; font-weight: 700; color: #06b6d4; margin-bottom: 6px;">Mesh Networking</div>
                        <div style="font-size: 12px; color: var(--muted); line-height: 1.5;">Ad-hoc mesh formation for swarm operations with automatic node discovery and routing</div>
                    </div>
                    <div style="background: linear-gradient(135deg, rgba(124,77,255,0.15), rgba(124,77,255,0.05)); border: 1px solid rgba(124,77,255,0.3); border-radius: 12px; padding: 20px; text-align: center;">
                        <div style="font-size: 32px; margin-bottom: 8px;">&#129302;</div>
                        <div style="font-size: 14px; font-weight: 700; color: var(--accent); margin-bottom: 6px;">Distributed Fusion</div>
                        <div style="font-size: 12px; color: var(--muted); line-height: 1.5;">Multi-platform sensor fusion combining vision, RF, and positioning data across the fleet</div>
                    </div>
                    <div style="background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05)); border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; padding: 20px; text-align: center;">
                        <div style="font-size: 32px; margin-bottom: 8px;">&#129504;</div>
                        <div style="font-size: 14px; font-weight: 700; color: #10b981; margin-bottom: 6px;">Collaborative AI</div>
                        <div style="font-size: 12px; color: var(--muted); line-height: 1.5;">Edge-to-edge model sharing and collaborative inference for enhanced situational awareness</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div style="background: var(--panel-light); padding: 16px; border-radius: 10px;">
                        <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text);">&#127919; Swarm Coordination</div>
                        <ul style="font-size: 12px; color: var(--muted); line-height: 1.8; padding-left: 16px; margin: 0;">
                            <li>Autonomous task allocation across platforms</li>
                            <li>Dynamic formation control and path planning</li>
                            <li>Resilient operation with node loss tolerance</li>
                        </ul>
                    </div>
                    <div style="background: var(--panel-light); padding: 16px; border-radius: 10px;">
                        <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px; color: var(--text);">&#128274; Secure Fleet Comms</div>
                        <ul style="font-size: 12px; color: var(--muted); line-height: 1.8; padding-left: 16px; margin: 0;">
                            <li>Post-quantum encrypted fleet messaging</li>
                            <li>LPI/LPD waveforms for covert coordination</li>
                            <li>Zero-trust node authentication</li>
                        </ul>
                    </div>
                </div>

                <div style="margin-top: 16px; padding: 14px 16px; background: linear-gradient(135deg, rgba(6,182,212,0.1), rgba(124,77,255,0.1)); border-radius: 8px; border-left: 3px solid #06b6d4;">
                    <p style="font-size: 13px; color: var(--text); margin: 0;">
                        <strong style="color: #06b6d4;">Multi-Domain Ready:</strong>
                        Fleet intelligence capabilities span UAVs, UGVs, USVs, and fixed installations—enabling heterogeneous swarm operations with unified command and control.
                    </p>
                </div>
            </div>

            <!-- Software-to-Hardware Mapping -->
            <div class="panel" style="margin-top: 24px; border-left: 3px solid var(--gold);">
                <h3 style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 24px;">&#128187;</span>
                    Software-to-Hardware Mapping
                </h3>
                <p style="color: var(--muted); margin: 12px 0 20px 0; font-size: 14px; line-height: 1.6;">
                    How software agents leverage the LVS-250 UCIe 2.0 chiplet architecture for optimal performance and efficiency.
                </p>

                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; margin-bottom: 20px;">
                    <div style="background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05)); border: 1px solid rgba(59,130,246,0.3); border-radius: 12px; padding: 16px; text-align: center;">
                        <div style="font-size: 13px; font-weight: 700; color: #3b82f6; margin-bottom: 8px;">Interface Chiplet</div>
                        <div style="font-size: 11px; color: var(--muted); line-height: 1.5;">High-speed I/O, RF Front-end, PCIe Gen5, CXL 2.0</div>
                    </div>
                    <div style="background: linear-gradient(135deg, rgba(124,77,255,0.15), rgba(124,77,255,0.05)); border: 1px solid rgba(124,77,255,0.3); border-radius: 12px; padding: 16px; text-align: center;">
                        <div style="font-size: 13px; font-weight: 700; color: var(--accent); margin-bottom: 8px;">Dual NPU</div>
                        <div style="font-size: 11px; color: var(--muted); line-height: 1.5;">~230 TOPS Combined, Vision Processing, Neural Inference</div>
                    </div>
                    <div style="background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05)); border: 1px solid rgba(16,185,129,0.3); border-radius: 12px; padding: 16px; text-align: center;">
                        <div style="font-size: 13px; font-weight: 700; color: #10b981; margin-bottom: 8px;">Vector DSP</div>
                        <div style="font-size: 11px; color: var(--muted); line-height: 1.5;">Signal Processing, Sensor Fusion, Feature Extraction</div>
                    </div>
                    <div style="background: linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05)); border: 1px solid rgba(212,175,55,0.3); border-radius: 12px; padding: 16px; text-align: center;">
                        <div style="font-size: 13px; font-weight: 700; color: var(--gold); margin-bottom: 8px;">RISC-V Cluster</div>
                        <div style="font-size: 11px; color: var(--muted); line-height: 1.5;">Decision Logic, Agent Orchestration, Safety Supervisor</div>
                    </div>
                    <div style="background: linear-gradient(135deg, rgba(236,72,153,0.15), rgba(236,72,153,0.05)); border: 1px solid rgba(236,72,153,0.3); border-radius: 12px; padding: 16px; text-align: center;">
                        <div style="font-size: 13px; font-weight: 700; color: #ec4899; margin-bottom: 8px;">MRAM Subsystem</div>
                        <div style="font-size: 11px; color: var(--muted); line-height: 1.5;">Persistent Logging, Model Storage, State Preservation</div>
                    </div>
                </div>

                <h4 style="font-size: 14px; font-weight: 600; margin-bottom: 16px; color: var(--text);">Information Flow Pipeline</h4>
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; background: var(--panel-light); padding: 16px; border-radius: 12px; flex-wrap: wrap;">
                    <div style="text-align: center; flex: 1; min-width: 80px;">
                        <div style="background: rgba(59,130,246,0.2); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px; font-size: 12px; font-weight: 700; color: #3b82f6;">1</div>
                        <div style="font-size: 11px; font-weight: 600; color: var(--text);">RF Acquisition</div>
                        <div style="font-size: 10px; color: var(--muted);">Interface Chiplet</div>
                    </div>
                    <div style="color: var(--muted); font-size: 16px;">→</div>
                    <div style="text-align: center; flex: 1; min-width: 80px;">
                        <div style="background: rgba(16,185,129,0.2); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px; font-size: 12px; font-weight: 700; color: #10b981;">2</div>
                        <div style="font-size: 11px; font-weight: 600; color: var(--text);">Signal Processing</div>
                        <div style="font-size: 10px; color: var(--muted);">Vector DSP</div>
                    </div>
                    <div style="color: var(--muted); font-size: 16px;">→</div>
                    <div style="text-align: center; flex: 1; min-width: 80px;">
                        <div style="background: rgba(124,77,255,0.2); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px; font-size: 12px; font-weight: 700; color: var(--accent);">3</div>
                        <div style="font-size: 11px; font-weight: 600; color: var(--text);">Threat Classification</div>
                        <div style="font-size: 10px; color: var(--muted);">Dual NPU (~230 TOPS)</div>
                    </div>
                    <div style="color: var(--muted); font-size: 16px;">→</div>
                    <div style="text-align: center; flex: 1; min-width: 80px;">
                        <div style="background: rgba(212,175,55,0.2); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px; font-size: 12px; font-weight: 700; color: var(--gold);">4</div>
                        <div style="font-size: 11px; font-weight: 600; color: var(--text);">Autonomous Decision</div>
                        <div style="font-size: 10px; color: var(--muted);">RISC-V CPU Cluster</div>
                    </div>
                    <div style="color: var(--muted); font-size: 16px;">→</div>
                    <div style="text-align: center; flex: 1; min-width: 80px;">
                        <div style="background: rgba(236,72,153,0.2); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px; font-size: 12px; font-weight: 700; color: #ec4899;">5</div>
                        <div style="font-size: 11px; font-weight: 600; color: var(--text);">Persistent Logging</div>
                        <div style="font-size: 10px; color: var(--muted);">MRAM Subsystem</div>
                    </div>
                    <div style="color: var(--muted); font-size: 16px;">→</div>
                    <div style="text-align: center; flex: 1; min-width: 80px;">
                        <div style="background: rgba(6,182,212,0.2); width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 6px; font-size: 12px; font-weight: 700; color: #06b6d4;">6</div>
                        <div style="font-size: 11px; font-weight: 600; color: var(--text);">Fleet Learning</div>
                        <div style="font-size: 10px; color: var(--muted);">Secure Data Links</div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 16px;">
                    <div style="background: var(--panel-light); padding: 14px; border-radius: 10px;">
                        <div style="font-size: 12px; font-weight: 600; color: var(--text); margin-bottom: 6px;">&#128230; Package Specs</div>
                        <div style="font-size: 11px; color: var(--muted); line-height: 1.5;">35x35mm on GF 12LP. 5 UCIe 2.0 chiplets with 672 GB/s interconnect. &lt;25W TDP.</div>
                    </div>
                    <div style="background: var(--panel-light); padding: 14px; border-radius: 10px;">
                        <div style="font-size: 12px; font-weight: 600; color: var(--text); margin-bottom: 6px;">&#127909; Vision Pipeline</div>
                        <div style="font-size: 11px; color: var(--muted); line-height: 1.5;">4K@60fps processing through dedicated NPU cores. Detection, segmentation, pose run in parallel.</div>
                    </div>
                    <div style="background: var(--panel-light); padding: 14px; border-radius: 10px;">
                        <div style="font-size: 12px; font-weight: 600; color: var(--text); margin-bottom: 6px;">&#127777; Environmental</div>
                        <div style="font-size: 11px; color: var(--muted); line-height: 1.5;">-40°C to +105°C operating range. Hardware root of trust with secure boot.</div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Generate Specifications Tab HTML
     */
    getSpecsTab() {
        const s = this.specs;
        const pb = s.powerBreakdown;

        return `
            <div class="welcome" style="margin-bottom: 24px;">
                <div class="welcome-content">
                    <h1>Technical <span>Specifications</span></h1>
                    <p>Detailed specifications for the LVS-250 processor</p>
                </div>
            </div>

            <!-- Core Specs -->
            <div class="panel">
                <h3>Core Specifications</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 14px 16px; color: var(--muted); width: 40%;">Process Technology</td>
                        <td style="padding: 14px 16px; font-weight: 600;">${s.processNode}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 14px 16px; color: var(--muted);">Architecture</td>
                        <td style="padding: 14px 16px; font-weight: 600;">${s.chipletCount}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 14px 16px; color: var(--muted);">NPU Performance</td>
                        <td style="padding: 14px 16px; font-weight: 600;">${s.npuPerformance}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 14px 16px; color: var(--muted);">CPU Complex</td>
                        <td style="padding: 14px 16px; font-weight: 600;">${s.cpuCores}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 14px 16px; color: var(--muted);">Real-Time Cores</td>
                        <td style="padding: 14px 16px; font-weight: 600;">${s.riscvCores}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 14px 16px; color: var(--muted);">Autonomy Stack</td>
                        <td style="padding: 14px 16px; font-weight: 600;">${s.autonomyStack}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 14px 16px; color: var(--muted);">Vector DSP</td>
                        <td style="padding: 14px 16px; font-weight: 600;">${s.vdsp}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 14px 16px; color: var(--muted);">Main Memory</td>
                        <td style="padding: 14px 16px; font-weight: 600;">${s.mainMemory}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 14px 16px; color: var(--muted);">Persistent Storage</td>
                        <td style="padding: 14px 16px; font-weight: 600;">${s.persistentStorage}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 14px 16px; color: var(--muted);">Package Size</td>
                        <td style="padding: 14px 16px; font-weight: 600;">${s.packageSize}</td>
                    </tr>
                    <tr>
                        <td style="padding: 14px 16px; color: var(--muted);">Operating Temperature</td>
                        <td style="padding: 14px 16px; font-weight: 600;">${s.tempRange}</td>
                    </tr>
                </table>
            </div>

            <!-- Power Specifications -->
            <div class="panel" style="margin-top: 24px;">
                <h3>Power Specifications</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px;">
                    <div style="background: rgba(16,185,129,0.1); padding: 20px; border-radius: 12px; text-align: center; border: 1px solid rgba(16,185,129,0.2);">
                        <div style="font-size: 24px; font-weight: 800; color: #10b981;">${s.tdpTypical}</div>
                        <div style="font-size: 12px; color: var(--muted); margin-top: 4px;">Typical TDP</div>
                    </div>
                    <div style="background: rgba(245,158,11,0.1); padding: 20px; border-radius: 12px; text-align: center; border: 1px solid rgba(245,158,11,0.2);">
                        <div style="font-size: 24px; font-weight: 800; color: #f59e0b;">${s.tdpMaximum}</div>
                        <div style="font-size: 12px; color: var(--muted); margin-top: 4px;">Maximum TDP</div>
                    </div>
                    <div style="background: rgba(124,77,255,0.1); padding: 20px; border-radius: 12px; text-align: center; border: 1px solid rgba(124,77,255,0.2);">
                        <div style="font-size: 24px; font-weight: 800; color: #7c4dff;">${s.nominalWorkload}</div>
                        <div style="font-size: 12px; color: var(--muted); margin-top: 4px;">Nominal Workload</div>
                    </div>
                </div>

                <h4 style="font-size: 14px; margin-bottom: 12px; color: var(--text);">Power Budget Breakdown</h4>
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <thead>
                        <tr style="background: var(--panel-light);">
                            <th style="padding: 10px 12px; text-align: left; font-weight: 600;">Component</th>
                            <th style="padding: 10px 12px; text-align: center; font-weight: 600;">Typical</th>
                            <th style="padding: 10px 12px; text-align: center; font-weight: 600;">Peak</th>
                            <th style="padding: 10px 12px; text-align: left; font-weight: 600;">Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${Object.entries(pb).map(([key, val]) => `
                            <tr style="border-bottom: 1px solid rgba(255,255,255,0.04);">
                                <td style="padding: 10px 12px; text-transform: uppercase; font-weight: 600; font-size: 11px; color: var(--accent);">${key}</td>
                                <td style="padding: 10px 12px; text-align: center;">${val.typical}</td>
                                <td style="padding: 10px 12px; text-align: center;">${val.peak}</td>
                                <td style="padding: 10px 12px; color: var(--muted); font-size: 12px;">${val.notes}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div style="margin-top: 16px; padding: 14px 16px; background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(124,77,255,0.1)); border-radius: 8px; border-left: 3px solid #10b981;">
                    <p style="font-size: 13px; color: var(--text); margin: 0;">
                        <strong style="color: #10b981;">Power Efficiency:</strong>
                        The LVS-250 achieves ~${s.powerEfficiency} efficiency, enabling ROS2 + multi-model AI workloads within the ${s.nominalWorkload} envelope.
                    </p>
                </div>
            </div>

            <!-- I/O & Interfaces -->
            <div class="panel" style="margin-top: 24px;">
                <h3>I/O & Interfaces</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 14px 16px; color: var(--muted); width: 40%;">PCIe</td>
                        <td style="padding: 14px 16px; font-weight: 600;">${s.pcie}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 14px 16px; color: var(--muted);">Camera Interfaces</td>
                        <td style="padding: 14px 16px; font-weight: 600;">${s.cameraInterfaces}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 14px 16px; color: var(--muted);">USB</td>
                        <td style="padding: 14px 16px; font-weight: 600;">${s.usb}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 14px 16px; color: var(--muted);">RF Modem</td>
                        <td style="padding: 14px 16px; font-weight: 600;">${s.rf}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 14px 16px; color: var(--muted);">Covert Comms</td>
                        <td style="padding: 14px 16px; font-weight: 600;">${s.rfCovert}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 14px 16px; color: var(--muted);">Debug</td>
                        <td style="padding: 14px 16px; font-weight: 600;">${s.debug}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 14px 16px; color: var(--muted);">Security</td>
                        <td style="padding: 14px 16px; font-weight: 600;">${s.security}</td>
                    </tr>
                    <tr>
                        <td style="padding: 14px 16px; color: var(--muted);">Encryption</td>
                        <td style="padding: 14px 16px; font-weight: 600;">${s.encryption}</td>
                    </tr>
                </table>
            </div>

            <!-- Performance -->
            <div class="panel" style="margin-top: 24px;">
                <h3>Performance Metrics</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                    <div style="background: var(--panel-light); padding: 20px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 24px; font-weight: 800; color: var(--accent);">${s.latency}</div>
                        <div style="font-size: 12px; color: var(--muted); margin-top: 4px;">Sensor-to-Decision Latency</div>
                    </div>
                    <div style="background: var(--panel-light); padding: 20px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 24px; font-weight: 800; color: var(--gold);">4K@60fps</div>
                        <div style="font-size: 12px; color: var(--muted); margin-top: 4px;">Video Processing</div>
                    </div>
                    <div style="background: var(--panel-light); padding: 20px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 24px; font-weight: 800; color: var(--success);">${s.combinedTops}</div>
                        <div style="font-size: 12px; color: var(--muted); margin-top: 4px;">Combined NPU TOPS</div>
                    </div>
                </div>
            </div>

            <!-- Fleet Intelligence -->
            <div class="panel" style="margin-top: 24px;">
                <h3>Fleet Intelligence Capabilities</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 14px 16px; color: var(--muted); width: 40%;">Multi-Platform Coordination</td>
                        <td style="padding: 14px 16px; font-weight: 600;">${s.fleetIntel}</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 14px 16px; color: var(--muted);">Mesh Networking</td>
                        <td style="padding: 14px 16px; font-weight: 600;">${s.meshNetwork}</td>
                    </tr>
                    <tr>
                        <td style="padding: 14px 16px; color: var(--muted);">Collaborative AI</td>
                        <td style="padding: 14px 16px; font-weight: 600;">${s.collaborativeAI}</td>
                    </tr>
                </table>
                <div style="margin-top: 16px; padding: 14px 16px; background: linear-gradient(135deg, rgba(6,182,212,0.1), rgba(124,77,255,0.1)); border-radius: 8px; border-left: 3px solid #06b6d4;">
                    <p style="font-size: 13px; color: var(--text); margin: 0;">
                        <strong style="color: #06b6d4;">Swarm-Ready Architecture:</strong>
                        Built-in support for UAV, UGV, USV, and fixed installation coordination with zero-trust authentication and PQC-encrypted fleet messaging.
                    </p>
                </div>
            </div>
        `;
    },

    /**
     * Generate DevKit Tab HTML
     */
    getDevKitTab() {
        return `
            <div class="welcome" style="margin-bottom: 24px;">
                <div class="welcome-content">
                    <h1>LVS-250 <span>Development Kit</span></h1>
                    <p>Hardware platform for software development and system integration</p>
                </div>
            </div>

            <div class="feature-grid">
                <div class="feature-card">
                    <div class="feature-icon">&#128187;</div>
                    <div class="feature-title">LVS-250 Evaluation Board</div>
                    <div class="feature-desc">Full-featured development board with LVS-250 production silicon, integrated power management, and comprehensive I/O breakout.</div>
                    <span class="feature-tag">Ships ${this.specs.productionTarget}</span>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">&#128247;</div>
                    <div class="feature-title">Camera Interface Module</div>
                    <div class="feature-desc">8-channel MIPI CSI-2 daughter card with reference camera sensors. Supports 4K60 per channel, synchronized capture.</div>
                    <span class="feature-tag">Included</span>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">&#128268;</div>
                    <div class="feature-title">Power & Debug Module</div>
                    <div class="feature-desc">Integrated JTAG debugger, power monitoring, thermal management. Real-time telemetry via USB-C.</div>
                    <span class="feature-tag">Included</span>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">&#128752;</div>
                    <div class="feature-title">RF Development Add-on</div>
                    <div class="feature-desc">Optional RF modem evaluation board for SDR and SATCOM development. Includes antenna interfaces and spectrum analyzer hooks.</div>
                    <span class="feature-tag">Optional Add-on</span>
                </div>
            </div>

            <div class="panel">
                <h3>Development Kit Contents</h3>
                <table class="specs-table">
                    <thead>
                        <tr><th>Item</th><th>Quantity</th><th>Description</th></tr>
                    </thead>
                    <tbody>
                        <tr><td>LVS-250 Eval Board</td><td>1</td><td>Main development platform with production silicon</td></tr>
                        <tr><td>Camera Module</td><td>2</td><td>IMX577 12MP reference cameras</td></tr>
                        <tr><td>MIPI Ribbon Cables</td><td>8</td><td>15cm flex cables for camera connection</td></tr>
                        <tr><td>Power Supply</td><td>1</td><td>65W USB-C PD adapter</td></tr>
                        <tr><td>Debug Cable</td><td>1</td><td>USB-C to USB-A debug/programming cable</td></tr>
                        <tr><td>Heatsink Assembly</td><td>1</td><td>Active cooling solution with 40mm fan</td></tr>
                        <tr><td>Quick Start Guide</td><td>1</td><td>Printed getting started documentation</td></tr>
                        <tr><td>SD Card</td><td>1</td><td>64GB with pre-loaded SDK and examples</td></tr>
                    </tbody>
                </table>
            </div>

            <div class="panel" style="margin-top: 24px;">
                <h3>Development Kit Specifications</h3>
                <div class="specs-section">
                    <table class="specs-table">
                        <tr><td>Board Dimensions</td><td>170 x 170mm (Mini-ITX compatible)</td></tr>
                        <tr><td>Power Input</td><td>12-20V DC, USB-C PD</td></tr>
                        <tr><td>Host Interface</td><td>PCIe Gen5 x8 edge connector</td></tr>
                        <tr><td>Expansion</td><td>2x M.2 (NVMe), 1x FMC+ (FPGA add-on)</td></tr>
                        <tr><td>Network</td><td>2x 10GbE RJ45, 1x 1GbE management</td></tr>
                        <tr><td>Video Output</td><td>1x HDMI 2.1, 1x DisplayPort 1.4</td></tr>
                        <tr><td>Debug</td><td>JTAG, UART console, LED indicators</td></tr>
                    </table>
                </div>
            </div>
        `;
    },

    /**
     * Generate Software Platform Tab HTML (formerly SDK)
     */
    getSoftwarePlatformTab() {
        return `
            <div class="welcome" style="margin-bottom: 24px;">
                <div class="welcome-content">
                    <h1>LVS <span>Software Development Platform</span></h1>
                    <p>Complete toolchain for neural network deployment, system integration, and application development</p>
                </div>
            </div>

            <!-- For Decision Makers / For Engineers -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
                <div style="background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05)); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 24px;">
                    <div style="font-size: 14px; color: var(--accent-light); font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">For Decision Makers</div>
                    <h3 style="font-size: 20px; margin-bottom: 12px; color: var(--text);">Accelerate Time-to-Deployment</h3>
                    <p style="font-size: 14px; color: var(--muted); line-height: 1.6; margin-bottom: 16px;">
                        Your existing vision AI applications run on LVS hardware with minimal code changes.
                        No vendor lock-in, no rewrites. Move from prototype to production edge deployment
                        in weeks, not months.
                    </p>
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                        <span style="background: rgba(16,185,129,0.2); color: #10b981; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">70% Faster Integration</span>
                        <span style="background: rgba(16,185,129,0.2); color: #10b981; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">Zero Lock-in</span>
                    </div>
                </div>
                <div style="background: linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05)); border: 1px solid rgba(212,175,55,0.3); border-radius: 16px; padding: 24px;">
                    <div style="font-size: 14px; color: var(--gold); font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">For Engineers</div>
                    <h3 style="font-size: 20px; margin-bottom: 12px; color: var(--text);">We Handle the Hard Parts</h3>
                    <p style="font-size: 14px; color: var(--muted); line-height: 1.6; margin-bottom: 16px;">
                        About 40% of vision AI code is image pre/post-processing—resizing, normalization,
                        color conversion, NMS, anchor decoding. Our model-optimized APIs handle all of it.
                        You focus on your application logic.
                    </p>
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                        <span style="background: rgba(212,175,55,0.2); color: var(--gold); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">YOLO Optimized</span>
                        <span style="background: rgba(212,175,55,0.2); color: var(--gold); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">OpenPose Ready</span>
                        <span style="background: rgba(212,175,55,0.2); color: var(--gold); padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">Custom Models</span>
                    </div>
                </div>
            </div>

            <!-- Write Once, Deploy Anywhere -->
            <div class="panel" style="margin-bottom: 24px; border-left: 3px solid var(--accent);">
                <h3 style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 24px;">&#128260;</span>
                    Write Once, Deploy Anywhere
                </h3>
                <p style="color: var(--muted); margin: 12px 0 20px 0; font-size: 14px; line-height: 1.6;">
                    The LVS SDK abstracts hardware complexity, enabling your application code to run across different
                    compute targets without modification. Develop on your workstation, deploy to edge—same code, optimized execution.
                </p>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; text-align: center;">
                    <div style="background: var(--panel-light); padding: 16px; border-radius: 8px;">
                        <div style="font-size: 28px; margin-bottom: 8px;">&#128187;</div>
                        <div style="font-size: 12px; color: var(--muted);">DEVELOP</div>
                        <div style="font-size: 14px; font-weight: 600;">x86 Workstation</div>
                    </div>
                    <div style="background: var(--panel-light); padding: 16px; border-radius: 8px;">
                        <div style="font-size: 28px; margin-bottom: 8px;">&#9654;</div>
                        <div style="font-size: 12px; color: var(--muted);">SIMULATE</div>
                        <div style="font-size: 14px; font-weight: 600;">GPU Server</div>
                    </div>
                    <div style="background: var(--panel-light); padding: 16px; border-radius: 8px;">
                        <div style="font-size: 28px; margin-bottom: 8px;">&#128736;</div>
                        <div style="font-size: 12px; color: var(--muted);">VALIDATE</div>
                        <div style="font-size: 14px; font-weight: 600;">DevKit</div>
                    </div>
                    <div style="background: linear-gradient(135deg, rgba(212,175,55,0.2), rgba(124,77,255,0.2)); padding: 16px; border-radius: 8px; border: 1px solid var(--gold);">
                        <div style="font-size: 28px; margin-bottom: 8px;">&#128640;</div>
                        <div style="font-size: 12px; color: var(--gold);">DEPLOY</div>
                        <div style="font-size: 14px; font-weight: 600; color: var(--gold);">LVS-250 Edge</div>
                    </div>
                </div>
            </div>

            <!-- Model-Optimized APIs -->
            <div class="panel" style="margin-bottom: 24px; border-left: 3px solid var(--gold);">
                <h3 style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 24px;">&#129504;</span>
                    Model-Optimized APIs
                </h3>
                <p style="color: var(--muted); margin: 12px 0 20px 0; font-size: 14px; line-height: 1.6;">
                    Each supported model family has a dedicated API that handles the complete inference pipeline—from raw pixels to actionable results.
                    No manual tensor manipulation, no post-processing code, no edge cases to debug.
                </p>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                    <div style="background: var(--panel-light); padding: 20px; border-radius: 12px;">
                        <div style="font-size: 13px; color: var(--accent-light); font-weight: 600; margin-bottom: 8px;">OBJECT DETECTION</div>
                        <div style="font-size: 18px; font-weight: 700; margin-bottom: 12px;">YOLO Family</div>
                        <ul style="font-size: 13px; color: var(--muted); line-height: 1.8; padding-left: 16px; margin: 0;">
                            <li>YOLOv5, v7, v8, v9 supported</li>
                            <li>Automatic letterboxing & scaling</li>
                            <li>Built-in NMS & confidence filtering</li>
                            <li>Bbox, class, confidence output</li>
                        </ul>
                    </div>
                    <div style="background: var(--panel-light); padding: 20px; border-radius: 12px;">
                        <div style="font-size: 13px; color: var(--accent-light); font-weight: 600; margin-bottom: 8px;">POSE ESTIMATION</div>
                        <div style="font-size: 18px; font-weight: 700; margin-bottom: 12px;">OpenPose & More</div>
                        <ul style="font-size: 13px; color: var(--muted); line-height: 1.8; padding-left: 16px; margin: 0;">
                            <li>17/25/135 keypoint models</li>
                            <li>Multi-person detection</li>
                            <li>Skeleton rendering utilities</li>
                            <li>Action recognition ready</li>
                        </ul>
                    </div>
                    <div style="background: var(--panel-light); padding: 20px; border-radius: 12px;">
                        <div style="font-size: 13px; color: var(--accent-light); font-weight: 600; margin-bottom: 8px;">SEGMENTATION</div>
                        <div style="font-size: 18px; font-weight: 700; margin-bottom: 12px;">Instance & Semantic</div>
                        <ul style="font-size: 13px; color: var(--muted); line-height: 1.8; padding-left: 16px; margin: 0;">
                            <li>Mask R-CNN, SAM support</li>
                            <li>Per-pixel class labels</li>
                            <li>Contour extraction built-in</li>
                            <li>Depth estimation fusion</li>
                        </ul>
                    </div>
                </div>
                <div style="margin-top: 20px; padding: 16px; background: rgba(16,185,129,0.1); border-radius: 8px; border-left: 3px solid #10b981;">
                    <p style="font-size: 13px; color: var(--text); margin: 0;">
                        <strong style="color: #10b981;">Developer Productivity Gain:</strong>
                        Our model-optimized APIs eliminate ~40% of typical vision AI code—the tedious image preprocessing,
                        tensor manipulation, and output parsing that developers usually write from scratch.
                    </p>
                </div>
            </div>

            <!-- SDK Architecture Overview -->
            <div class="screenshot">
                <div class="screenshot-label">SDK Architecture Overview</div>
                <div class="screenshot-title">LVS Software Development Platform</div>
                <div class="screenshot-preview" style="text-align: left; padding: 30px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                        <div style="background: rgba(124,77,255,0.2); padding: 16px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 11px; color: var(--muted); margin-bottom: 4px;">APPLICATION LAYER</div>
                            <div style="font-size: 13px; font-weight: 600;">Customer Applications</div>
                        </div>
                        <div style="background: rgba(124,77,255,0.2); padding: 16px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 11px; color: var(--muted); margin-bottom: 4px;">REFERENCE APPS</div>
                            <div style="font-size: 13px; font-weight: 600;">Vision Pipelines</div>
                        </div>
                        <div style="background: rgba(124,77,255,0.2); padding: 16px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 11px; color: var(--muted); margin-bottom: 4px;">DEMO APPLICATIONS</div>
                            <div style="font-size: 13px; font-weight: 600;">Object Detection</div>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                        <div style="background: rgba(212,175,55,0.2); padding: 16px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 11px; color: var(--muted); margin-bottom: 4px;">LVS RUNTIME</div>
                            <div style="font-size: 13px; font-weight: 600;">Neural Inference Engine</div>
                        </div>
                        <div style="background: rgba(212,175,55,0.2); padding: 16px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 11px; color: var(--muted); margin-bottom: 4px;">LVS VISION</div>
                            <div style="font-size: 13px; font-weight: 600;">Image Processing Library</div>
                        </div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 20px;">
                        <div style="background: rgba(16,185,129,0.2); padding: 16px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 11px; color: var(--muted); margin-bottom: 4px;">NPU DRIVER</div>
                            <div style="font-size: 13px; font-weight: 600;">Kernel Module</div>
                        </div>
                        <div style="background: rgba(16,185,129,0.2); padding: 16px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 11px; color: var(--muted); margin-bottom: 4px;">CAMERA DRIVER</div>
                            <div style="font-size: 13px; font-weight: 600;">V4L2 / ISP</div>
                        </div>
                        <div style="background: rgba(16,185,129,0.2); padding: 16px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 11px; color: var(--muted); margin-bottom: 4px;">SYSTEM SERVICES</div>
                            <div style="font-size: 13px; font-weight: 600;">Power / Thermal</div>
                        </div>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 16px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 11px; color: var(--muted); margin-bottom: 4px;">HARDWARE</div>
                        <div style="font-size: 13px; font-weight: 600;">LVS-250 Neural Compute Engine</div>
                    </div>
                </div>
            </div>

            <!-- SDK Components -->
            <div class="feature-grid">
                <div class="feature-card">
                    <div class="feature-icon">&#128640;</div>
                    <div class="feature-title">LVS Neural Compiler</div>
                    <div class="feature-desc">Deploy any vision model—from open-source networks to your proprietary IP—optimized specifically for LVS-250 silicon. Automatic fine-tuning of layer scheduling, quantization, and memory layout delivers 3-5x performance gains over generic inference.</div>
                    <span class="feature-tag">Your Models, Optimized</span>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">&#9881;</div>
                    <div class="feature-title">LVS Runtime</div>
                    <div class="feature-desc">Production-grade inference engine that maximizes throughput on LVS-250. Dynamic batching, multi-model orchestration, and zero-copy pipelines tuned for real-time vision workloads.</div>
                    <span class="feature-tag">C++ / Python APIs</span>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">&#128248;</div>
                    <div class="feature-title">LVS Vision Library</div>
                    <div class="feature-desc">Hardware-accelerated preprocessing and postprocessing. Resize, warp, color convert, and filter at camera-rate speeds. Drop-in replacement for OpenCV with 10x acceleration.</div>
                    <span class="feature-tag">10x Faster than CPU</span>
                </div>
                <div class="feature-card">
                    <div class="feature-icon">&#128202;</div>
                    <div class="feature-title">LVS Profiler</div>
                    <div class="feature-desc">Understand exactly where your model spends time. Layer-by-layer analysis, memory bandwidth visualization, and optimization recommendations specific to your architecture.</div>
                    <span class="feature-tag">GUI + CLI</span>
                </div>
            </div>

            <!-- Value Proposition Callout -->
            <div class="panel" style="background: linear-gradient(135deg, rgba(124,77,255,0.15), rgba(212,175,55,0.1)); border-left: 3px solid var(--accent);">
                <h3 style="margin-bottom: 12px;">Bring Your Own Model</h3>
                <p style="color: var(--text); font-size: 14px; line-height: 1.7; margin: 0;">
                    The LVS compiler doesn't just run models—it <strong>fine-tunes them for our silicon</strong>. Whether you're deploying a standard detection network or proprietary computer vision IP, our toolchain automatically optimizes tensor layouts, operator fusion, and memory scheduling to extract maximum performance from the LVS-250's dual NPU architecture.
                </p>
            </div>

            <!-- Code Sample -->
            <div class="panel" style="margin-top: 24px;">
                <h3>Quick Start Example</h3>
                <div class="code-block">
<span class="code-comment"># LVS SDK - Deploy Any Vision Model</span>
<span class="code-keyword">import</span> lvs
<span class="code-keyword">from</span> lvs.vision <span class="code-keyword">import</span> Camera, ImageProcessor
<span class="code-keyword">from</span> lvs.inference <span class="code-keyword">import</span> Runtime

<span class="code-comment"># Initialize runtime on LVS-250</span>
runtime = lvs.<span class="code-function">Runtime</span>(device=<span class="code-string">"lvs250"</span>)

<span class="code-comment"># Load YOUR compiled model (any ONNX, PyTorch, or TensorFlow model)</span>
model = runtime.<span class="code-function">load_model</span>(<span class="code-string">"your_model.lvs"</span>)  <span class="code-comment"># Optimized for LVS-250</span>

<span class="code-comment"># Configure camera pipeline</span>
camera = Camera.<span class="code-function">open</span>(channel=0, resolution=(1920, 1080), fps=30)
processor = ImageProcessor(resize=model.input_size, normalize=<span class="code-keyword">True</span>)

<span class="code-comment"># Real-time inference loop</span>
<span class="code-keyword">for</span> frame <span class="code-keyword">in</span> camera.<span class="code-function">stream</span>():
    tensor = processor.<span class="code-function">preprocess</span>(frame)
    results = model.<span class="code-function">infer</span>(tensor)  <span class="code-comment"># Runs on dual NPU @ 250 TOPS</span>
    <span class="code-keyword">print</span>(f<span class="code-string">"Inference: {model.last_inference_ms:.1f}ms"</span>)
                </div>
            </div>

            <!-- SDK Documentation -->
            <div class="panel" style="margin-top: 24px;">
                <h3>SDK Documentation</h3>
                <div class="document">
                    <div class="doc-icon">&#128218;</div>
                    <div class="doc-info">
                        <div class="doc-name">LVS SDK Getting Started Guide</div>
                        <div class="doc-meta">PDF &bull; 45 pages &bull; v1.0</div>
                    </div>
                    <span class="doc-download">&#8594;</span>
                </div>
                <div class="document">
                    <div class="doc-icon">&#128196;</div>
                    <div class="doc-info">
                        <div class="doc-name">LVS Runtime API Reference</div>
                        <div class="doc-meta">HTML &bull; C++ / Python &bull; v1.0</div>
                    </div>
                    <span class="doc-download">&#8594;</span>
                </div>
                <div class="document">
                    <div class="doc-icon">&#128202;</div>
                    <div class="doc-info">
                        <div class="doc-name">Model Optimization Guide</div>
                        <div class="doc-meta">PDF &bull; Best practices for your models &bull; v1.0</div>
                    </div>
                    <span class="doc-download">&#8594;</span>
                </div>
                <div class="document">
                    <div class="doc-icon">&#127891;</div>
                    <div class="doc-info">
                        <div class="doc-name">Tutorial: Custom Model Deployment</div>
                        <div class="doc-meta">Jupyter Notebook &bull; End-to-end walkthrough</div>
                    </div>
                    <span class="doc-download">&#8594;</span>
                </div>
            </div>
        `;
    },

    /**
     * Alias for backwards compatibility
     */
    getSDKTab() {
        return this.getSoftwarePlatformTab();
    },

    /**
     * Generate Documents Tab HTML
     */
    getDocumentsTab() {
        return `
            <div class="welcome" style="margin-bottom: 24px;">
                <div class="welcome-content">
                    <h1>Partner <span>Documents</span></h1>
                    <p>Agreements, proposals, and technical documentation</p>
                </div>
            </div>
            <div class="panel">
                <h3>Technical Documentation</h3>
                <div style="display: flex; align-items: center; gap: 14px; padding: 14px; background: var(--panel-light); border-radius: 10px; margin-bottom: 10px;">
                    <div style="width: 40px; height: 40px; background: rgba(124, 77, 255, 0.15); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--accent);">&#128196;</div>
                    <div style="flex: 1;">
                        <div style="font-size: 13px; font-weight: 600;">LVS-250 Product Brief</div>
                        <div style="font-size: 11px; color: var(--muted);">High-level product overview</div>
                    </div>
                    <span style="color: var(--accent); font-size: 12px;">&#8594;</span>
                </div>
                <div style="display: flex; align-items: center; gap: 14px; padding: 14px; background: var(--panel-light); border-radius: 10px; margin-bottom: 10px;">
                    <div style="width: 40px; height: 40px; background: rgba(124, 77, 255, 0.15); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--accent);">&#128203;</div>
                    <div style="flex: 1;">
                        <div style="font-size: 13px; font-weight: 600;">Technical Specifications</div>
                        <div style="font-size: 11px; color: var(--muted);">Detailed hardware specifications</div>
                    </div>
                    <span style="color: var(--accent); font-size: 12px;">&#8594;</span>
                </div>
                <div style="display: flex; align-items: center; gap: 14px; padding: 14px; background: var(--panel-light); border-radius: 10px; margin-bottom: 10px;">
                    <div style="width: 40px; height: 40px; background: rgba(124, 77, 255, 0.15); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--accent);">&#128218;</div>
                    <div style="flex: 1;">
                        <div style="font-size: 13px; font-weight: 600;">SDK Documentation</div>
                        <div style="font-size: 11px; color: var(--muted);">Software development kit guide</div>
                    </div>
                    <span style="color: var(--accent); font-size: 12px;">&#8594;</span>
                </div>
                <div style="display: flex; align-items: center; gap: 14px; padding: 14px; background: var(--panel-light); border-radius: 10px;">
                    <div style="width: 40px; height: 40px; background: rgba(124, 77, 255, 0.15); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--accent);">&#128187;</div>
                    <div style="flex: 1;">
                        <div style="font-size: 13px; font-weight: 600;">API Reference</div>
                        <div style="font-size: 11px; color: var(--muted);">Runtime API documentation</div>
                    </div>
                    <span style="color: var(--accent); font-size: 12px;">&#8594;</span>
                </div>
            </div>
            <div class="panel" style="margin-top: 24px;">
                <h3>Partnership Documents</h3>
                <p style="color: var(--muted); font-size: 13px; margin-bottom: 16px;">Contact your LVS representative for access to partnership-specific documents.</p>
                <div style="background: linear-gradient(135deg, rgba(124,77,255,0.1), rgba(212,175,55,0.1)); padding: 16px; border-radius: 10px; border-left: 3px solid var(--gold);">
                    <div style="font-size: 13px; color: var(--text);">
                        <strong style="color: var(--gold);">Need additional documents?</strong><br>
                        Contact <a href="mailto:partners@lolavisionsystems.com" style="color: var(--accent);">partners@lolavisionsystems.com</a>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Generate Integration Tab HTML (for partners)
     */
    getIntegrationTab() {
        return `
            <div class="welcome" style="margin-bottom: 24px;">
                <div class="welcome-content">
                    <h1>Partner <span>Integration</span></h1>
                    <p>UCIe 2.0 chiplet integration guide for silicon partners</p>
                </div>
                <div style="background: linear-gradient(135deg, #ed8936, #c05621); padding: 12px 20px; border-radius: 10px; display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 20px;">&#128204;</span>
                    <span style="font-size: 14px; font-weight: 600; color: white;">Partner Integration</span>
                </div>
            </div>

            <!-- Architecture Diagram -->
            <div class="panel" style="background: linear-gradient(135deg, rgba(124,77,255,0.1), rgba(237,137,54,0.1)); border: 1px solid rgba(237,137,54,0.3);">
                <h3 style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 18px;">&#128204;</span>
                    UCIe 2.0 Integration Architecture
                </h3>
                <p style="color: var(--muted); font-size: 14px; margin-bottom: 20px;">LVS-250 Neural Compute Engine + Partner Platform</p>

                <div style="display: grid; grid-template-columns: 1fr auto 1fr; gap: 16px; align-items: center; margin-bottom: 20px;">
                    <div style="background: rgba(124,77,255,0.2); padding: 20px; border-radius: 12px; text-align: center; border: 1px solid rgba(124,77,255,0.3);">
                        <div style="font-size: 13px; color: var(--muted); margin-bottom: 4px;">LVS-250</div>
                        <div style="font-size: 16px; font-weight: 700; color: var(--accent);">Neural Compute</div>
                        <div style="font-size: 11px; color: var(--muted); margin-top: 4px;">5-Chiplet Package</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 24px; color: var(--gold);">&#8596;</div>
                        <div style="font-size: 10px; color: var(--gold); font-weight: 600;">UCIe 2.0</div>
                    </div>
                    <div style="background: rgba(237,137,54,0.2); padding: 20px; border-radius: 12px; text-align: center; border: 1px solid rgba(237,137,54,0.3);">
                        <div style="font-size: 13px; color: var(--muted); margin-bottom: 4px;">Partner</div>
                        <div style="font-size: 16px; font-weight: 700; color: #ed8936;">Platform</div>
                        <div style="font-size: 11px; color: var(--muted); margin-top: 4px;">Host Integration</div>
                    </div>
                </div>
            </div>

            <!-- Interface Specifications -->
            <div class="panel" style="margin-top: 24px;">
                <h3>UCIe 2.0 Interface Specifications</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 14px 16px; color: var(--muted); width: 40%;">Interface Standard</td>
                        <td style="padding: 14px 16px; font-weight: 600;">UCIe 2.0 (Universal Chiplet Interconnect Express)</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 14px 16px; color: var(--muted);">Topology</td>
                        <td style="padding: 14px 16px; font-weight: 600;">Point-to-point chiplet interconnect</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 14px 16px; color: var(--muted);">Data Rate</td>
                        <td style="padding: 14px 16px; font-weight: 600;">32 GT/s per lane</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 14px 16px; color: var(--muted);">Lane Configuration</td>
                        <td style="padding: 14px 16px; font-weight: 600;">16 lanes (configurable)</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 14px 16px; color: var(--muted);">Protocol Support</td>
                        <td style="padding: 14px 16px; font-weight: 600;">PCIe 6.0 / CXL 3.0 compatible</td>
                    </tr>
                    <tr style="border-bottom: 1px solid rgba(255,255,255,0.06);">
                        <td style="padding: 14px 16px; color: var(--muted);">Power Efficiency</td>
                        <td style="padding: 14px 16px; font-weight: 600;">&lt; 0.5 pJ/bit</td>
                    </tr>
                    <tr>
                        <td style="padding: 14px 16px; color: var(--muted);">Aggregate Bandwidth</td>
                        <td style="padding: 14px 16px; font-weight: 600;">${this.specs.interconnectBandwidth}</td>
                    </tr>
                </table>
            </div>

            <!-- Integration Phases -->
            <div class="panel" style="margin-top: 24px;">
                <h3>Integration Process</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                    <div style="background: var(--panel-light); padding: 20px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 28px; font-weight: 800; color: var(--accent);">1</div>
                        <div style="font-size: 13px; font-weight: 600; margin-top: 8px;">Specification Review</div>
                        <div style="font-size: 11px; color: var(--muted); margin-top: 4px;">Interface compatibility</div>
                    </div>
                    <div style="background: var(--panel-light); padding: 20px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 28px; font-weight: 800; color: var(--gold);">2</div>
                        <div style="font-size: 13px; font-weight: 600; margin-top: 8px;">Electrical Validation</div>
                        <div style="font-size: 11px; color: var(--muted); margin-top: 4px;">Signal integrity testing</div>
                    </div>
                    <div style="background: var(--panel-light); padding: 20px; border-radius: 12px; text-align: center;">
                        <div style="font-size: 28px; font-weight: 800; color: var(--success);">3</div>
                        <div style="font-size: 13px; font-weight: 600; margin-top: 8px;">System Integration</div>
                        <div style="font-size: 11px; color: var(--muted); margin-top: 4px;">Platform bring-up</div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Generate Support Tab HTML
     */
    getSupportTab() {
        return `
            <div class="welcome" style="margin-bottom: 24px;">
                <div class="welcome-content">
                    <h1>Technical <span>Support</span></h1>
                    <p>Get help from the Lola Vision Systems team</p>
                </div>
            </div>
            <div class="grid">
                <div class="panel">
                    <h3>Support Channels</h3>
                    <p style="color: var(--muted); font-size: 14px; margin-bottom: 16px;">
                        For technical questions, partnership inquiries, or general support, please reach out through any of these channels.
                    </p>
                    <div style="background: var(--panel-light); padding: 16px; border-radius: 10px; margin-bottom: 12px;">
                        <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">Email Support</div>
                        <div style="font-size: 14px; color: var(--accent);">partners@lolavisionsystems.com</div>
                    </div>
                    <div style="background: var(--panel-light); padding: 16px; border-radius: 10px;">
                        <div style="font-size: 13px; font-weight: 600; margin-bottom: 8px;">Response Time</div>
                        <div style="font-size: 14px; color: var(--success);">Within 24 hours</div>
                    </div>
                </div>
                <div class="panel">
                    <h3>Your LVS Contact</h3>
                    <div class="contact-card">
                        <h4>Dedicated Support</h4>
                        <div class="contact-person">
                            <div class="contact-avatar">TA</div>
                            <div class="contact-info">
                                <h5>Tayo Adesanya</h5>
                                <p>CEO &bull; Lola Vision Systems</p>
                            </div>
                        </div>
                        <div class="contact-actions" style="flex-direction: column; gap: 8px;">
                            <div style="display: flex; gap: 8px;">
                                <a href="https://wa.me/16304792126" target="_blank" class="contact-btn primary" style="text-decoration: none; text-align: center;">WhatsApp</a>
                                <a href="sms:+16304792126" class="contact-btn secondary" style="text-decoration: none; text-align: center;">iMessage</a>
                            </div>
                            <a href="mailto:tayo@lolavisionsystems.com" class="contact-btn secondary" style="text-decoration: none; text-align: center; width: 100%;">Email</a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Generate Demos Tab HTML
     */
    getDemosTab() {
        return `
            <div class="video-section-header">
                <h2>Real-Time Object Detection, Recognition &amp; Tracking</h2>
                <p>LVS Software running multiple fine-tuned vision models in parallel, capturing mission-critical details in real-time.</p>
                <div style="margin-top: 16px; display: flex; flex-wrap: wrap; gap: 8px;">
                    <span style="background: rgba(124,77,255,0.2); color: var(--accent-light); padding: 6px 12px; border-radius: 20px; font-size: 12px;">Vehicle Detection</span>
                    <span style="background: rgba(124,77,255,0.2); color: var(--accent-light); padding: 6px 12px; border-radius: 20px; font-size: 12px;">Personnel Tracking</span>
                    <span style="background: rgba(124,77,255,0.2); color: var(--accent-light); padding: 6px 12px; border-radius: 20px; font-size: 12px;">Threat Classification</span>
                    <span style="background: rgba(124,77,255,0.2); color: var(--accent-light); padding: 6px 12px; border-radius: 20px; font-size: 12px;">Perimeter Monitoring</span>
                    <span style="background: rgba(124,77,255,0.2); color: var(--accent-light); padding: 6px 12px; border-radius: 20px; font-size: 12px;">Anomaly Detection</span>
                </div>
            </div>

            <!-- SDK Context for Demos -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                <div style="background: linear-gradient(135deg, rgba(124,77,255,0.1), transparent); border: 1px solid rgba(124,77,255,0.2); border-radius: 12px; padding: 20px;">
                    <div style="font-size: 12px; color: var(--accent-light); font-weight: 600; margin-bottom: 6px;">WHAT YOU'RE SEEING</div>
                    <p style="font-size: 14px; color: var(--text); margin: 0; line-height: 1.6;">
                        These demos run on the <strong>LVS SDK</strong> using our YOLO-optimized API.
                        The same code powering these demos can run on your development machine today,
                        then deploy to LVS-250 hardware without changes.
                    </p>
                </div>
                <div style="background: linear-gradient(135deg, rgba(212,175,55,0.1), transparent); border: 1px solid rgba(212,175,55,0.2); border-radius: 12px; padding: 20px;">
                    <div style="font-size: 12px; color: var(--gold); font-weight: 600; margin-bottom: 6px;">UNDER THE HOOD</div>
                    <p style="font-size: 14px; color: var(--text); margin: 0; line-height: 1.6;">
                        Multiple models run simultaneously: object detection, tracking, and classification.
                        All pre/post-processing—letterboxing, NMS, coordinate scaling—handled automatically
                        by our model-optimized APIs.
                    </p>
                </div>
            </div>

            <div class="video-grid single-row">
                <div class="video-card">
                    <div style="background: var(--panel-light); padding: 8px 16px; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 16px;">&#9728;</span>
                        <span style="font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Day-Time Detection</span>
                    </div>
                    <video class="demo-video" autoplay muted loop playsinline>
                        <source src="assets/demos/demo-1.mp4" type="video/mp4">
                    </video>
                    <div class="video-card-info">
                        <div class="video-card-title">Visible Spectrum Analysis</div>
                        <div class="video-card-desc">High-accuracy object detection and tracking in daylight conditions</div>
                    </div>
                </div>
                <div class="video-card">
                    <div style="background: var(--panel-light); padding: 8px 16px; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 16px;">&#9789;</span>
                        <span style="font-weight: 600; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Night-Time Detection</span>
                    </div>
                    <video class="demo-video" autoplay muted loop playsinline>
                        <source src="assets/demos/demo-2.mp4" type="video/mp4">
                    </video>
                    <div class="video-card-info">
                        <div class="video-card-title">Low-Light &amp; IR Analysis</div>
                        <div class="video-card-desc">Thermal and infrared detection for 24/7 operational capability</div>
                    </div>
                </div>
            </div>
            <div style="margin-top: 24px; padding: 16px 20px; background: linear-gradient(135deg, rgba(124,77,255,0.1), rgba(212,175,55,0.1)); border-radius: 12px; border-left: 3px solid var(--gold);">
                <p style="font-size: 13px; color: var(--text); margin: 0;">
                    <strong style="color: var(--gold);">LVS-250 Performance Note:</strong>
                    The LVS-250 delivers <strong>3-5x performance efficiency</strong> compared to current solutions, enabling either
                    <em>increased FPS for faster detection</em> or <em>reduced power consumption</em> for extended mission duration—a critical trade-off benefit for edge deployment.
                </p>
            </div>
        `;
    },

    /**
     * Generate Testimonials Tab HTML
     */
    getTestimonialsTab() {
        return `
            <div class="video-section-header">
                <h2>Expert Testimonials</h2>
                <p>Industry leaders share their perspective on edge AI and the LVS platform. Hover to preview, click to play full video.</p>
            </div>
            <div class="video-grid testimonials-grid">
                <div class="video-card">
                    <video class="testimonial-video" preload="auto" muted playsinline poster="assets/testimonials/JamesUrgencyforChips-poster.jpg">
                        <source src="assets/testimonials/JamesUrgencyforChips.mp4" type="video/mp4">
                    </video>
                    <div class="play-overlay"><span>&#9658;</span></div>
                    <div class="video-card-info">
                        <div class="video-card-title">The Urgency for Domestic Chips</div>
                        <div class="video-card-speaker">
                            <div class="speaker-avatar">JS</div>
                            <div class="speaker-info">
                                <div class="speaker-name">James Stewart</div>
                                <div class="speaker-title">Industry Expert</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="video-card">
                    <video class="testimonial-video" preload="auto" muted playsinline poster="assets/testimonials/JamesEWexplanation-poster.jpg">
                        <source src="assets/testimonials/JamesEWexplanation.mp4" type="video/mp4">
                    </video>
                    <div class="play-overlay"><span>&#9658;</span></div>
                    <div class="video-card-info">
                        <div class="video-card-title">Electronic Warfare Explained</div>
                        <div class="video-card-speaker">
                            <div class="speaker-avatar">JS</div>
                            <div class="speaker-info">
                                <div class="speaker-name">James Stewart</div>
                                <div class="speaker-title">Industry Expert</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="video-card">
                    <video class="testimonial-video" preload="auto" muted playsinline poster="assets/testimonials/RandyChipletConfiguration-poster.jpg">
                        <source src="assets/testimonials/RandyChipletConfiguration.mp4" type="video/mp4">
                    </video>
                    <div class="play-overlay"><span>&#9658;</span></div>
                    <div class="video-card-info">
                        <div class="video-card-title">Chiplet Configuration Benefits</div>
                        <div class="video-card-speaker">
                            <div class="speaker-avatar">RH</div>
                            <div class="speaker-info">
                                <div class="speaker-name">Randy Hollines</div>
                                <div class="speaker-title">Industry Expert</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="video-card">
                    <video class="testimonial-video" preload="auto" muted playsinline poster="assets/testimonials/MaynardHwEdgeAISecurityPriorities-poster.jpg">
                        <source src="assets/testimonials/MaynardHwEdgeAISecurityPriorities.mp4" type="video/mp4">
                    </video>
                    <div class="play-overlay"><span>&#9658;</span></div>
                    <div class="video-card-info">
                        <div class="video-card-title">Edge AI Security Priorities</div>
                        <div class="video-card-speaker">
                            <div class="speaker-avatar">MH</div>
                            <div class="speaker-info">
                                <div class="speaker-name">Maynard Holliday</div>
                                <div class="speaker-title">Industry Expert</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="video-card">
                    <video class="testimonial-video" preload="auto" muted playsinline poster="assets/testimonials/MaynardChineseThreat-poster.jpg">
                        <source src="assets/testimonials/MaynardChineseThreat.mp4" type="video/mp4">
                    </video>
                    <div class="play-overlay"><span>&#9658;</span></div>
                    <div class="video-card-info">
                        <div class="video-card-title">Addressing the China Challenge</div>
                        <div class="video-card-speaker">
                            <div class="speaker-avatar">MH</div>
                            <div class="speaker-info">
                                <div class="speaker-name">Maynard Holliday</div>
                                <div class="speaker-title">Industry Expert</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // ==========================================================================
    // INITIALIZATION
    // ==========================================================================

    /**
     * Initialize shared tabs on a portal page
     * Call this after DOM is loaded
     */
    init() {
        // Inject content into tab containers
        const tabMappings = {
            'product': this.getProductTab(),
            'specs': this.getSpecsTab(),
            'devkit': this.getDevKitTab(),
            'sdk': this.getSoftwarePlatformTab(),
            'software-platform': this.getSoftwarePlatformTab(),
            'support': this.getSupportTab(),
            'demos': this.getDemosTab(),
            'testimonials': this.getTestimonialsTab(),
            'documents': this.getDocumentsTab(),
            'integration': this.getIntegrationTab()
        };

        for (const [tabId, content] of Object.entries(tabMappings)) {
            const container = document.getElementById(tabId);
            if (container) {
                container.innerHTML = content;
            }
        }

        // Initialize video behaviors
        this.initVideos();
    },

    /**
     * Initialize video playback behaviors
     */
    initVideos() {
        const isMobile = window.innerWidth <= 768;

        // Demo videos - 2x speed autoplay
        document.querySelectorAll('.demo-video').forEach(video => {
            video.playbackRate = 2.0;
            video.play().catch(() => {});
            video.style.cursor = 'pointer';
            video.addEventListener('click', () => {
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
            });
        });

        // Testimonial videos - hover preview, click for overlay
        const testimonialVideos = document.querySelectorAll('.testimonial-video');
        const videoOverlay = document.getElementById('videoOverlay');
        const overlayVideo = document.getElementById('overlayVideo');
        const overlayBackdrop = document.querySelector('.video-overlay-backdrop');
        const overlayClose = document.querySelector('.video-overlay-close');

        if (!videoOverlay || !overlayVideo) return;

        function pauseAllTestimonials() {
            testimonialVideos.forEach(v => {
                v.pause();
                v.currentTime = 0;
            });
        }

        function openVideoOverlay(videoSrc) {
            pauseAllTestimonials();
            overlayVideo.src = videoSrc;
            videoOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            overlayVideo.play().catch(() => {});
        }

        function closeVideoOverlay() {
            videoOverlay.classList.remove('active');
            overlayVideo.pause();
            overlayVideo.src = '';
            document.body.style.overflow = '';
        }

        if (overlayClose) overlayClose.addEventListener('click', closeVideoOverlay);
        if (overlayBackdrop) overlayBackdrop.addEventListener('click', closeVideoOverlay);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && videoOverlay.classList.contains('active')) {
                closeVideoOverlay();
            }
        });

        testimonialVideos.forEach(video => {
            video.playbackRate = 1.0;
            video.loop = true;
            video.style.cursor = 'pointer';
            const videoSrc = video.querySelector('source')?.src || video.src;

            video.addEventListener('click', (e) => {
                e.preventDefault();
                openVideoOverlay(videoSrc);
            });

            if (!isMobile) {
                video.addEventListener('mouseenter', () => {
                    pauseAllTestimonials();
                    video.play().catch(() => {});
                });
                video.addEventListener('mouseleave', () => {
                    video.pause();
                    video.currentTime = 0;
                });
            }
        });
    }
};

// Auto-export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LVSSharedTabs;
}
