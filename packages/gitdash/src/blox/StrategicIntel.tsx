/**
 * StrategicIntel — Portals convergence map, moat analysis, action plan, hit list
 * Enriched with MiroFish simulation signals (sim_d88bafd30a24) + WarpJobs market data (2026-03-17)
 */

import { useState } from "preact/hooks";

const TABS = ["Convergence map", "Portals moat", "Action plan", "Hit list", "H3M Stories"];

// ─── H3M Stories — extracted from h3m.ai (client-side SPA, 2026-03-19) ──────
const h3mStories = [
	{
		id: "immersive-commerce",
		title: "Immersive Commerce",
		client: "KEVIN HART: GRAN CORAMINO",
		year: "2024",
		tags: ["AR/VR", "Retail", "Interactive"],
		description:
			"Revolutionary shopping environment blending physical and digital interactions through advanced AR technology. Customers step into a spatial brand world rather than viewing products from outside.",
		color: "#D85A30",
	},
	{
		id: "virtual-performances",
		title: "Virtual Performances",
		client: "THE HUME COLLECTIVE",
		year: "2023",
		tags: ["Digital Twin", "Smart Cities", "Analytics"],
		description:
			"Comprehensive digital twin solution integrating real-time data into immersive performance spaces. Bridging physical event venues with persistent spatial data layers.",
		color: "#534AB7",
	},
	{
		id: "immersive-concerts",
		title: "Immersive Concerts",
		client: "JUSTIN BIEBER",
		year: "2023",
		tags: ["Entertainment", "ML", "Personalization"],
		description:
			"Personalized concert experience powered by machine learning and behavioral analytics. Global fans access spatial audio and visual experiences that transcend physical venue limitations.",
		color: "#378ADD",
	},
	{
		id: "level-design-cinematics",
		title: "Level Design & Cinematics",
		client: "UBISOFT + WAR",
		year: "2023",
		tags: ["Gaming", "Spatial Design", "Cinematics"],
		description:
			"Real-time level design and cinematic pipeline for AAA gaming. Immersive world-building tools enabling rapid iteration between concept and playable environments.",
		color: "#1D9E75",
	},
	{
		id: "animation-ai-style",
		title: "Animation & AI Style Transfer",
		client: "RIOT GAMES + WAR",
		year: "2024",
		tags: ["AI", "Animation", "Style Transfer"],
		description:
			"Cutting-edge AI style transfer pipeline for cinematic game animation. Neural rendering applied to character animation and environmental storytelling at production scale.",
		color: "#639922",
	},
];

const h3mServices = [
	{
		id: "brand",
		title: "Brand",
		subtitle: "Immersive Brand Storytelling",
		description:
			"Transform your brand narrative into immersive experiences that resonate with modern audiences. AI-powered platform enables brands to create spatial environments where customers don't just view products — they step into your story. Build emotional connections through interactive brand worlds that blend physical retail with digital augmentation.",
	},
	{
		id: "retail",
		title: "Retail",
		subtitle: "Immersive Shopping in Mixed Reality",
		description:
			"Revolutionize the shopping experience by merging physical and digital retail spaces. Create virtual showrooms where customers explore products in 3D, customize items in real-time, and visualize purchases in their own environment before buying. Brands deliver personalized, interactive shopping journeys across any device.",
	},
	{
		id: "entertainment",
		title: "Entertainment",
		subtitle: "Live Events and Concert Experiences",
		description:
			"Bring live performances into any space with AI-generated immersive environments. Create virtual concert venues, interactive music videos, and fan experiences that transcend physical limitations. Artists connect with global audiences through spatial audio and visual experiences.",
	},
];

const h3mMission =
	"H3M is the engine powering the next generation of reality. We fuse AI, spatial computing, and immersive storytelling to build borderless digital worlds. Our team of AI PhDs and agency veterans have worked with the world's greatest brands, performers, and entertainment companies — recognized with gold Emmys, Tellys, Clios, and Cannes Lions.";

// ─── MiroFish Simulation Signals (sim_d88bafd30a24, 34 agents, 10 rounds) ───
const miroSim = {
	config: "34 agents, 10 types, 10 rounds. 59 total actions (Twitter 23, Reddit 36).",
	graph: "35 nodes, 13 edges (0.37 edges/node — target ≥2.0 for quality).",
	wins: [
		"Viral demo videos are #1 perception driver — AR Enthusiasts + Developers drive sharing; Journalists pick up only after critical mass.",
		"Named partnerships (MiroFish, MIT SPARK Lab) shifted Investor/Journalist agents from skeptical → neutral in 1 round.",
		"Developer personas with 4+ graph edges produced 3× more engagement than generic accounts.",
		"Reddit generates deeper community formation (36 actions) vs Twitter reach (23 actions).",
	],
	risks: [
		"Voice-controlled AR raised privacy concerns organically — address proactively in launch messaging.",
		"Competitive framing vs Meta/Apple collapsed into spec wars. Frame as new category, not competitor.",
		"Collaborative AR features face practicality skepticism — show classrooms/studios, not tech demos.",
	],
	conversionGraph: [
		{ step: "Developer community (warm network)", weight: "weight=3.25 floor" },
		{ step: "Conference visibility (CVPR, SIGGRAPH)", weight: "network amplifier" },
		{ step: "Acquirer engineering team relationship", weight: "weight=55 floor" },
		{ step: "BD / Corp Dev conversation", weight: "conversion funnel" },
		{ step: "Term sheet", weight: "destination" },
	],
};

// ─── WarpJobs Market Signals (2026-03-17, 388 signal lines) ─────────────────
const warpStats = {
	total: 7630,
	relevant: 6538,
	xrJobs: 2193,
	aiJobs: 3986,
	seniorJobs: 3414,
	dreamCompanies: 15,
	dreamJobs: 100,
	hiringSprees: 32,
	vcLeads: 739,
	keyPeople: 194,
	sources: 23,
};

const convergenceLayers = [
	{
		id: "l1",
		label: "L1: Foundation models (commodity)",
		color: "#888780",
		items: [
			{ name: "Claude/GPT/Gemini/Qwen", note: "Converging. Don't over-invest in prompt tuning" },
			{ name: "Whisper v3-turbo", note: "95% parsed locally at $0. Voice is primary XR input" },
			{ name: "Luma Genie / Tripo", note: "$0.35/gen. Fallback for Icosa in enrichActions()" },
			{ name: "MCP protocol", note: "De facto standard. 3 custom MCPs already built" },
		],
		portals: "USE, don't build. Swap anytime. Cheaper inputs = better margins.",
	},
	{
		id: "l2",
		label: "L2: World models + spatial intelligence",
		color: "#D85A30",
		items: [
			{
				name: "V-JEPA 2.1 (Meta)",
				note: "1.2B params, dense features, zero-shot robot control. Open source Mar 16 2026",
			},
			{ name: "Genie 3 (DeepMind)", note: "Text → interactive 3D @ 24fps. Promptable events" },
			{
				name: "Marble + World API (World Labs)",
				note: "$1B raised. Splats + meshes + collision. Spark renderer OSS",
			},
			{ name: "Niantic LGM", note: "30B+ posed images. Reconstruct + Localize + Understand" },
			{
				name: "Khronos glTF 3DGS",
				note: "Gaussian splats extension. Ratification Q2 2026",
			},
		],
		portals:
			"XRAI format = native container. LOD-adaptive 3DGS runtime already deployed. CVPR paper validates.",
	},
	{
		id: "l3",
		label: "L3: Application layer (THE MOAT — wide open)",
		color: "#378ADD",
		items: [
			{
				name: "Voice-first creation UX",
				note: "91% local parse, <1ms. 143 tests across 14 categories",
			},
			{
				name: "XRAI format (protocol ownership)",
				note: "DNA encoding: 625:1 forests, 5000:1 terrain compression",
			},
			{
				name: "370+ VFX via shared compute substrate",
				note: "Single dispatch → depth/stencil/audio/pose. O(1) scaling",
			},
			{
				name: "Persistent geospatial scenes",
				note: "GPS → VIO → photometric alignment. Survive sessions",
			},
			{
				name: "Cross-platform: iOS/Quest/VisionPro/Web",
				note: "React Native OS + Unity Engine. 69 bridge msg types",
			},
		],
		portals: "THIS IS WHERE PORTALS LIVES. The layer that turns $5B in infra into user value.",
	},
];

const moatCards = [
	{
		title: "XRAI format",
		metric: "625:1 → 5000:1",
		unit: "compression",
		detail:
			"Generative encoding: store the process, not the output. L-systems, cellular automata, SDFs. KB not MB. DNA for spatial intelligence.",
		kbFiles: [
			"_XRAI_MASTER.md",
			"_XRAI_FORMAT_RESEARCH_2026.md",
			"_XRAI_HYPERGRAPH_WORLD_GENERATION.md",
		],
		competitors:
			"World Labs Marble outputs splats+meshes. XRAI consumes them as a native container.",
	},
	{
		title: "Voice-first creation",
		metric: "91%",
		unit: "local parse rate",
		detail:
			"3-layer: regex (<1ms, 91%) → cache (instant repeat) → cloud LLM fallback. 143 tests, 14 categories. $0 vs $0.03/req for cloud-only.",
		kbFiles: ["_XRAI_VOICE_ARCHITECTURE_PATTERNS.md", "_VOICE_COMPOSER_PATTERNS.md"],
		competitors:
			"LLMR (De la Torre et al.): 20-90s latency, $0.03/req. ShapesXR: voice but Quest-only.",
	},
	{
		title: "VFX rendering quality",
		metric: "370+",
		unit: "production effects",
		detail:
			"Shared spatial-media substrate: 1 compute dispatch feeds depth/stencil/audio/pose to all effects. Source-agnostic: live AR = recorded spatial video.",
		kbFiles: ["_VFX_MASTER_PATTERNS.md", "_VFX_AR_MASTER.md", "_KEIJIRO_METAVIDO_VFX_RESEARCH.md"],
		competitors:
			"No mobile competitor does GPU VFX Graph at this quality. Keijiro patterns (LaspVfx, Rcam2, MetavidoVFX) are the DNA.",
	},
	{
		title: "LOD-adaptive 3DGS",
		metric: "2.7-4.1×",
		unit: "speedup",
		detail:
			"4 tiers: HIGH (0-3m, full), MEDIUM (3-8m, 0.4N), LOW (8-25m, 0.15N), CULL (>25m). 60fps on iPhone 14 Pro. Thermal throttle response.",
		kbFiles: ["_GAUSSIAN_SPLATTING_VFX_PATTERNS.md", "_COMPUTE_SHADER_PATTERNS.md"],
		competitors:
			"LODGE (large-scale NeRF), VastGaussian (city-scale). Portals: mobile-first, not desktop.",
	},
	{
		title: "Bridge architecture",
		metric: "69",
		unit: "message types",
		detail:
			"React Native OS + Unity Engine. Typed JSON protocol. <16ms latency. UAAL integration no one else has shipped in production.",
		kbFiles: ["_UNITY_AS_A_LIBRARY_IOS.md", "_REACT_NATIVE_UNITY_INTEGRATION.md"],
		competitors:
			"No competitor ships RN+Unity hybrid at this scale. Platform-agnostic = acquisition-friendly.",
	},
	{
		title: "Data flywheel",
		metric: "2,400+",
		unit: "tests",
		detail:
			"Every voice command + scene composition = training data at $0. 95% local = zero-cost collection. 208 visual regression tests. Ship daily.",
		kbFiles: ["_UNITY_TEST_FRAMEWORK_PATTERNS.md", "_TEST_DEBUG_AUTOMATION_PATTERNS.md"],
		competitors:
			"Manus: $100M ARR in 8 months via user data. OpenClaw: 6,600 commits/month. Speed IS the moat.",
	},
];

const actionPlan = [
	{
		phase: "NOW → Apr 2026",
		title: "Ship the thin wedge",
		color: "#E24B4A",
		actions: [
			{
				action: "CVPR 2026 workshop submission",
				status: "done",
				detail: "4D World Models paper accepted. Validates technical credibility.",
			},
			{
				action: "Publish XRAI KnowledgeBase (308 files)",
				status: "ready",
				detail:
					"github.com/imclab/xrai/KnowledgeBase. OpenClaw playbook: open-source = distribution.",
			},
			{
				action: 'One "wow" demo: voice → AR scene → 2D recording',
				status: "building",
				detail:
					"The 2D video IS the viral marketing. TikTok/IG. Manus playbook: organic UGC. MiroFish sim: video demos produce 3× engagement vs text posts.",
			},
			{
				action: "World Labs Marble API integration",
				status: "planned",
				detail: "Marble → XRAI → Unity pipeline. $1B company's output consumed by Portals runtime.",
			},
		],
	},
	{
		phase: "May → Aug 2026",
		title: "Benchmark-first credibility",
		color: "#D85A30",
		actions: [
			{
				action: "Publish production benchmarks (CVPR axes 1-4)",
				status: "planned",
				detail:
					"Mobile rendering, geospatial alignment, temporal persistence, creator editability.",
			},
			{
				action: "Khronos glTF 3DGS integration",
				status: "tracking",
				detail: "Ratification Q2 2026. Portals already adopted. First-mover advantage.",
			},
			{
				action: "Android XR provider + Samsung Moohan",
				status: "planned",
				detail: "Unity 6.1+ supports it. 5+ devices in 2026. Google's platform play.",
			},
			{
				action: "SKILL.md system for XR patterns",
				status: "designed",
				detail: "OpenClaw: 17K+ skills. XRAI KB: 308 files. Convert to composable skill format.",
			},
		],
	},
	{
		phase: "Sep → Dec 2026",
		title: "Agentic XR platform",
		color: "#534AB7",
		actions: [
			{
				action: "jARvis agent runtime + OTALA cycle",
				status: "architected",
				detail:
					"Observe-Think-Act-Learn-Adapt. Always-on ambient + active modes. Constitution §Ambient.",
			},
			{
				action: "MCP server fleet: profiler + shader-vfx + build",
				status: "3 built",
				detail: "FastMCP + Pydantic v2. Unity-specific agent infrastructure.",
			},
			{
				action: "Normcore + agent networking",
				status: "planned",
				detail: "Multi-user + multi-agent XR sessions. ~$0.25/user/month target.",
			},
			{
				action: "V-JEPA 2.1 dense features for AR scene understanding",
				status: "research",
				detail: "Meta open-sourced Mar 16, 2026. Temporally consistent features for VisionPro.",
			},
		],
	},
	{
		phase: "Q1 2027",
		title: "Distribution & scale",
		color: "#1D9E75",
		actions: [
			{
				action: "Needle Engine WebXR App Clip (iOS bridge)",
				status: "researched",
				detail: "Safari WebXR gap solved. Instant AR access without app install.",
			},
			{
				action: "Enterprise API: voice-to-scene composition",
				status: "designed",
				detail: "REST + XRAI output. White-label ready. Composable spatial intelligence.",
			},
			{
				action: "Creator economy + spatial marketplace",
				status: "vision",
				detail:
					"Every creation = economic unit. Codelets, VFX, agent configs. Times Square = anyone's gallery.",
			},
			{
				action: "Target: a16z SPEEDRUN or strategic acquisition",
				status: "positioning",
				detail:
					"Platform-agnostic = acquisition-friendly. Apple/Meta/Google all potential acquirers.",
			},
		],
	},
];

// Hit list enriched with WarpJobs open position counts
const hitList = [
	{
		company: "World Labs",
		fit: "Direct",
		funding: "$1B Series B",
		openRoles: "–",
		why: "Marble outputs Gaussian splats + meshes. XRAI consumes them. Spark renderer (MIT) = same stack.",
		role: "VP/Director Eng",
		approach: "VC intro via a16z network. CVPR paper as credential.",
		color: "#D85A30",
	},
	{
		company: "Luma AI",
		fit: "Strong",
		funding: "$900M Series C",
		openRoles: "200+",
		why: "Genie API → XRAI pipeline. Creating 200 roles London 2026. Ray3 in Adobe Firefly.",
		role: "Senior Director",
		approach: "Direct apply + portfolio demo of Genie→Unity pipeline.",
		color: "#D4537E",
	},
	{
		company: "Gracia AI",
		fit: "Perfect",
		funding: "$1.7M seed",
		openRoles: "~5",
		why: "Full-stack 4DGS infra. Unity/Unreal plugins, WebGPU, Quest 3. Needs experienced leadership.",
		role: "CTO / Advisor",
		approach: "Direct outreach. Small team, big gap in leadership.",
		color: "#1D9E75",
	},
	{
		company: "Sesame",
		fit: "Strong",
		funding: "$250M Series B",
		openRoles: "–",
		why: "Oculus founders. AI smart glasses + voice. Lightweight HW + conversational AI.",
		role: "VP Eng",
		approach: "Oculus alumni network. Voice-first AR is direct overlap.",
		color: "#378ADD",
	},
	{
		company: "Anduril",
		fit: "Adjacent",
		funding: "Multi-B",
		openRoles: "579",
		why: "Lattice SDK. 1,427 open positions. Rust/Go. Palmer Luckey = Oculus DNA.",
		role: "Staff+ / Principal",
		approach: "Direct apply. Systems experience + XR pedigree.",
		color: "#534AB7",
	},
	{
		company: "XREAL",
		fit: "Strong",
		funding: "$100M+",
		openRoles: "–",
		why: "SDK 3.0 on Unity XR Plugin. Android XR + Google partnership. Direct skill match.",
		role: "Technical Advisor",
		approach: "Developer relations angle. SDK expertise.",
		color: "#639922",
	},
	{
		company: "Niantic Spatial",
		fit: "Direct",
		funding: "Spun from $3.5B deal",
		openRoles: "–",
		why: "LGM = 30B+ posed images. 8th Wall shutting down. Hideo Kojima partnership.",
		role: "Sr. Engineer / Architect",
		approach: "WebXR + spatial computing expertise. 8th Wall gap.",
		color: "#888780",
	},
];

// Market signals enriched with WarpJobs data
const marketSignals = [
	{ label: "Spatial computing 2035", val: "$1.2T", sub: "22% CAGR" },
	{ label: "AI agents 2030", val: "$52B", sub: "from $7.8B" },
	{ label: "VFX market 2034", val: "$600B", sub: "from $464B" },
	{ label: "Jobs tracked (WarpJobs)", val: "7,630", sub: "86% relevant" },
	{ label: "XR-relevant jobs", val: "2,193", sub: "28% of pool" },
	{ label: "Unity job mentions", val: "2,284", sub: "#1 keyword" },
	{ label: "Hiring sprees", val: "32", sub: "Anduril 579, OpenAI 333" },
	{ label: "AI glasses growth", val: "+211%", sub: "2025 shipments" },
	{ label: "VR headset decline", val: "-43%", sub: "paradigm shift" },
	{ label: "Agent skill demand", val: "+1587%", sub: "fastest growing" },
	{ label: "KB depth", val: "308", sub: "files, ~4MB" },
	{ label: "VC leads (WarpJobs)", val: "739", sub: "194 key people" },
];

const STATUS_COLORS: Record<string, string> = {
	done: "#1D9E75",
	ready: "#639922",
	building: "#D85A30",
	planned: "#378ADD",
	designed: "#534AB7",
	tracking: "#888780",
	research: "#D4537E",
	architected: "#D85A30",
	"3 built": "#1D9E75",
	researched: "#639922",
	vision: "#534AB7",
	positioning: "#888780",
};

function StatusDot({ status }: { status: string }) {
	return (
		<span
			style={{
				display: "inline-block",
				width: 8,
				height: 8,
				borderRadius: "50%",
				background: STATUS_COLORS[status] ?? "#888",
				marginRight: 6,
				flexShrink: 0,
			}}
		/>
	);
}

function ConvergenceTab() {
	const [expanded, setExpanded] = useState<number | null>(null);
	const [simOpen, setSimOpen] = useState(false);
	return (
		<div>
			{/* Market signals grid */}
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
					gap: 8,
					marginBottom: 20,
				}}
			>
				{marketSignals.map((m, _i) => (
					<div
						key={m.label}
						style={{
							background: "var(--color-background-secondary)",
							borderRadius: "var(--border-radius-md)",
							padding: "10px 12px",
						}}
					>
						<div style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>{m.label}</div>
						<div style={{ fontSize: 18, fontWeight: 500 }}>{m.val}</div>
						<div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{m.sub}</div>
					</div>
				))}
			</div>

			{/* MiroFish simulation block */}
			<div
				style={{
					marginBottom: 16,
					borderRadius: "var(--border-radius-lg)",
					border: "1.5px solid #534AB744",
					overflow: "hidden",
				}}
			>
				<div
					onClick={() => setSimOpen(!simOpen)}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") setSimOpen(!simOpen);
					}}
					style={{
						padding: "12px 16px",
						cursor: "pointer",
						borderLeft: "4px solid #534AB7",
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
					}}
				>
					<div>
						<div style={{ fontWeight: 500, fontSize: 14, color: "#534AB7" }}>
							MiroFish simulation — {miroSim.config}
						</div>
						<div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
							{miroSim.graph}
						</div>
					</div>
					<span
						style={{
							fontSize: 14,
							color: "var(--color-text-tertiary)",
							transform: simOpen ? "rotate(180deg)" : "none",
							transition: "transform 0.2s",
						}}
					>
						v
					</span>
				</div>
				{simOpen && (
					<div style={{ padding: "0 16px 14px", borderLeft: "4px solid #534AB7" }}>
						<div style={{ fontSize: 12, fontWeight: 500, color: "#1D9E75", marginBottom: 6 }}>
							Wins
						</div>
						{miroSim.wins.map((w, _i) => (
							<div
								key={w.slice(0, 20)}
								style={{
									fontSize: 12,
									color: "var(--color-text-secondary)",
									marginBottom: 4,
									lineHeight: 1.5,
								}}
							>
								• {w}
							</div>
						))}
						<div style={{ fontSize: 12, fontWeight: 500, color: "#E24B4A", margin: "10px 0 6px" }}>
							Anti-patterns / risks
						</div>
						{miroSim.risks.map((r, _i) => (
							<div
								key={r.slice(0, 20)}
								style={{
									fontSize: 12,
									color: "var(--color-text-secondary)",
									marginBottom: 4,
									lineHeight: 1.5,
								}}
							>
								• {r}
							</div>
						))}
						<div style={{ fontSize: 12, fontWeight: 500, color: "#D85A30", margin: "10px 0 6px" }}>
							Acqui-hire conversion graph
						</div>
						{miroSim.conversionGraph.map((step, i) => (
							<div
								key={step.step}
								style={{
									display: "flex",
									gap: 8,
									fontSize: 12,
									marginBottom: 3,
									alignItems: "baseline",
								}}
							>
								<span style={{ color: "var(--color-text-secondary)" }}>{i + 1}.</span>
								<span>{step.step}</span>
								<span
									style={{
										fontSize: 10,
										color: "#534AB7",
										padding: "1px 6px",
										background: "#534AB718",
										borderRadius: 8,
									}}
								>
									{step.weight}
								</span>
							</div>
						))}
					</div>
				)}
			</div>

			<p
				style={{
					fontSize: 13,
					color: "var(--color-text-secondary)",
					margin: "0 0 12px",
				}}
			>
				Niantic's three-layer thesis: LLMs (reasoning) + World Foundation Models (simulating) +
				Large Geospatial Models (grounding). Portals sits at L3 — the application layer that turns
				infrastructure into user value.
			</p>

			{convergenceLayers.map((layer, i) => (
				<div
					key={layer.id}
					style={{
						marginBottom: 12,
						borderRadius: "var(--border-radius-lg)",
						border: `1.5px solid ${layer.color}44`,
						overflow: "hidden",
					}}
				>
					<div
						onClick={() => setExpanded(expanded === i ? null : i)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") setExpanded(expanded === i ? null : i);
						}}
						style={{
							padding: "12px 16px",
							cursor: "pointer",
							borderLeft: `4px solid ${layer.color}`,
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<div>
							<div style={{ fontWeight: 500, fontSize: 14, color: layer.color }}>{layer.label}</div>
							<div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>
								{layer.portals}
							</div>
						</div>
						<span
							style={{
								fontSize: 14,
								color: "var(--color-text-tertiary)",
								transform: expanded === i ? "rotate(180deg)" : "none",
								transition: "transform 0.2s",
							}}
						>
							v
						</span>
					</div>
					{expanded === i && (
						<div style={{ padding: "0 16px 14px", borderLeft: `4px solid ${layer.color}` }}>
							{layer.items.map((item, _j) => (
								<div
									key={item.name}
									style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 13 }}
								>
									<span style={{ fontWeight: 500, minWidth: 200, flexShrink: 0 }}>{item.name}</span>
									<span style={{ color: "var(--color-text-secondary)" }}>{item.note}</span>
								</div>
							))}
						</div>
					)}
				</div>
			))}

			<div
				style={{
					padding: "12px 16px",
					borderRadius: "var(--border-radius-lg)",
					marginTop: 16,
					background: "var(--color-background-info)",
					border: "0.5px solid var(--color-border-info)",
				}}
			>
				<div
					style={{
						fontSize: 12,
						fontWeight: 500,
						color: "var(--color-text-info)",
						marginBottom: 4,
					}}
				>
					CVPR 2026 validates the thesis
				</div>
				<div
					style={{
						fontSize: 13,
						color: "var(--color-text-info)",
						lineHeight: 1.5,
					}}
				>
					The paper proves three coupled requirements can be satisfied together: real-time runtime
					on mobile (14.2ms on iPhone 14 Pro), persistent scene state across revisits, and
					creator-facing world editing. Four architectural principles generalize: generative
					encoding, layered fallback, upstream truncation, closed-loop refinement.
				</div>
			</div>
		</div>
	);
}

function MoatTab() {
	const [open, setOpen] = useState<number | null>(null);
	return (
		<div>
			<p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 12px" }}>
				Six moat pillars mapped to KB depth (308 files), CVPR evidence, and competitive landscape
			</p>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
					gap: 12,
				}}
			>
				{moatCards.map((card, i) => (
					<div
						key={card.title}
						onClick={() => setOpen(open === i ? null : i)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") setOpen(open === i ? null : i);
						}}
						style={{
							background: "var(--color-background-primary)",
							borderRadius: "var(--border-radius-lg)",
							border: "0.5px solid var(--color-border-tertiary)",
							padding: "14px 16px",
							cursor: "pointer",
						}}
					>
						<div
							style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}
						>
							<div style={{ fontWeight: 500, fontSize: 14 }}>{card.title}</div>
							<div style={{ textAlign: "right" }}>
								<span style={{ fontSize: 20, fontWeight: 500 }}>{card.metric}</span>
								<span style={{ fontSize: 11, color: "var(--color-text-secondary)", marginLeft: 4 }}>
									{card.unit}
								</span>
							</div>
						</div>
						{open === i && (
							<div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.6 }}>
								<div style={{ color: "var(--color-text-secondary)", marginBottom: 8 }}>
									{card.detail}
								</div>
								<div style={{ color: "var(--color-text-tertiary)", marginBottom: 4 }}>
									KB:{" "}
									{card.kbFiles.map((f, _j) => (
										<code
											key={f}
											style={{
												fontSize: 11,
												marginRight: 4,
												padding: "1px 4px",
												background: "var(--color-background-secondary)",
												borderRadius: 3,
											}}
										>
											{f}
										</code>
									))}
								</div>
								<div style={{ color: "var(--color-text-info)", fontSize: 11 }}>
									{card.competitors}
								</div>
							</div>
						)}
					</div>
				))}
			</div>
			<div
				style={{
					marginTop: 16,
					padding: "12px 16px",
					borderRadius: "var(--border-radius-lg)",
					background: "var(--color-background-secondary)",
				}}
			>
				<div style={{ fontWeight: 500, fontSize: 14, marginBottom: 6 }}>
					Constitution principle: commodity vs moat
				</div>
				<div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
					"As LLMs and 3D generation become cheaper commodities, Portals' value increases — we're
					the UX/rendering layer that turns commodity AI into user value. Cheaper inputs = better
					margins." The Manus playbook confirms: orchestration layer worth $2B+. OpenClaw confirms:
					execution layer attracts acqui-hires from OpenAI + Meta simultaneously.
				</div>
			</div>
		</div>
	);
}

function ActionTab() {
	return (
		<div>
			<p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 16px" }}>
				Concrete actions derived from Manus ($2B), OpenClaw (acqui-hire), and world model
				convergence playbooks
			</p>
			{actionPlan.map((phase, i) => (
				<div key={phase.phase} style={{ marginBottom: 20 }}>
					<div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
						<div
							style={{
								width: 32,
								height: 32,
								borderRadius: "50%",
								background: `${phase.color}18`,
								color: phase.color,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								fontWeight: 500,
								fontSize: 13,
								flexShrink: 0,
							}}
						>
							{i + 1}
						</div>
						<div>
							<div style={{ fontWeight: 500, fontSize: 14 }}>{phase.phase}</div>
							<div style={{ fontSize: 12, color: phase.color, fontWeight: 500 }}>{phase.title}</div>
						</div>
					</div>
					<div
						style={{
							marginLeft: 16,
							borderLeft: `2px solid ${phase.color}44`,
							paddingLeft: 20,
						}}
					>
						{phase.actions.map((a, _j) => (
							<div key={a.action} style={{ marginBottom: 10 }}>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: 4,
										fontSize: 13,
										fontWeight: 500,
										flexWrap: "wrap",
									}}
								>
									<StatusDot status={a.status} />
									{a.action}
									<span
										style={{
											fontSize: 10,
											padding: "1px 6px",
											borderRadius: 8,
											marginLeft: 4,
											background: "var(--color-background-secondary)",
											color: "var(--color-text-secondary)",
										}}
									>
										{a.status}
									</span>
								</div>
								<div
									style={{
										fontSize: 12,
										color: "var(--color-text-secondary)",
										marginLeft: 14,
										marginTop: 2,
										lineHeight: 1.5,
									}}
								>
									{a.detail}
								</div>
							</div>
						))}
					</div>
				</div>
			))}
		</div>
	);
}

function HitListTab() {
	return (
		<div>
			<p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 12px" }}>
				Target companies ranked by fit. WarpJobs signals: {warpStats.total.toLocaleString()} jobs
				tracked, {warpStats.dreamCompanies} dream companies, {warpStats.vcLeads} VC leads.
			</p>

			{/* WarpJobs keyword demand bar */}
			<div
				style={{
					marginBottom: 16,
					padding: "12px 16px",
					borderRadius: "var(--border-radius-lg)",
					background: "var(--color-background-secondary)",
				}}
			>
				<div style={{ fontWeight: 500, fontSize: 13, marginBottom: 8 }}>
					WarpJobs keyword demand (job mentions, 2026-03-17)
				</div>
				{[
					{ kw: "Unity", count: 2284 },
					{ kw: "Meta", count: 539 },
					{ kw: "API", count: 485 },
					{ kw: "Quest", count: 283 },
					{ kw: "ARKit", count: 221 },
					{ kw: "Gaussian Splatting", count: 125 },
				].map(({ kw, count }) => (
					<div key={kw} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
						<span style={{ fontSize: 12, minWidth: 130, color: "var(--color-text-secondary)" }}>
							{kw}
						</span>
						<div
							style={{
								height: 6,
								borderRadius: 3,
								background: "#378ADD",
								width: `${Math.round((count / 2284) * 100)}%`,
								minWidth: 4,
							}}
						/>
						<span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>{count}</span>
					</div>
				))}
			</div>

			{hitList.map((co, _i) => (
				<div
					key={co.company}
					style={{
						marginBottom: 12,
						borderRadius: "var(--border-radius-lg)",
						border: "0.5px solid var(--color-border-tertiary)",
						overflow: "hidden",
					}}
				>
					<div style={{ padding: "12px 16px", borderLeft: `4px solid ${co.color}` }}>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "baseline",
								flexWrap: "wrap",
								gap: 6,
							}}
						>
							<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
								<span style={{ fontWeight: 500, fontSize: 15 }}>{co.company}</span>
								<span
									style={{
										fontSize: 11,
										padding: "2px 8px",
										borderRadius: 8,
										fontWeight: 500,
										background: `${co.color}18`,
										color: co.color,
									}}
								>
									{co.fit} fit
								</span>
								{co.openRoles !== "–" && (
									<span
										style={{
											fontSize: 10,
											padding: "2px 6px",
											borderRadius: 8,
											background: "var(--color-background-secondary)",
											color: "var(--color-text-secondary)",
										}}
									>
										{co.openRoles} open roles
									</span>
								)}
							</div>
							<span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
								{co.funding}
							</span>
						</div>
						<div
							style={{
								fontSize: 13,
								color: "var(--color-text-secondary)",
								marginTop: 6,
								lineHeight: 1.5,
							}}
						>
							{co.why}
						</div>
						<div style={{ display: "flex", gap: 12, marginTop: 8, fontSize: 12, flexWrap: "wrap" }}>
							<div>
								<span style={{ color: "var(--color-text-tertiary)" }}>Role: </span>
								<span style={{ fontWeight: 500 }}>{co.role}</span>
							</div>
							<div>
								<span style={{ color: "var(--color-text-tertiary)" }}>Approach: </span>
								{co.approach}
							</div>
						</div>
					</div>
				</div>
			))}

			<div
				style={{
					marginTop: 16,
					padding: "12px 16px",
					borderRadius: "var(--border-radius-lg)",
					background: "var(--color-background-secondary)",
				}}
			>
				<div style={{ fontWeight: 500, fontSize: 14, marginBottom: 6 }}>
					The positioning statement
				</div>
				<div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
					"20+ years XR × CVPR 2026 paper × 308-file KB × production-deployed 4D world model runtime
					× voice-first creation engine. The person who bridges 'old 3D' (meshes, engines, VFX) and
					'new 3D' (neural rendering, world models, agentic AI). Very few people globally have this
					combination."
				</div>
			</div>
		</div>
	);
}

function H3mStoriesTab() {
	const [openService, setOpenService] = useState<string | null>(null);
	return (
		<div>
			{/* Mission */}
			<div
				style={{
					padding: "12px 16px",
					borderRadius: "var(--border-radius-lg)",
					background: "var(--color-background-secondary)",
					marginBottom: 16,
					borderLeft: "4px solid #D85A30",
				}}
			>
				<div style={{ fontSize: 12, fontWeight: 500, color: "#D85A30", marginBottom: 4 }}>
					h3m.ai — The Future is Immersive
				</div>
				<div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
					{h3mMission}
				</div>
			</div>

			{/* Project stories */}
			<div style={{ fontWeight: 500, fontSize: 14, marginBottom: 10 }}>Portfolio stories</div>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
					gap: 12,
					marginBottom: 20,
				}}
			>
				{h3mStories.map((story) => (
					<div
						key={story.id}
						style={{
							borderRadius: "var(--border-radius-lg)",
							border: `1.5px solid ${story.color}33`,
							overflow: "hidden",
						}}
					>
						<div
							style={{
								padding: "12px 16px",
								borderLeft: `4px solid ${story.color}`,
							}}
						>
							<div
								style={{
									display: "flex",
									justifyContent: "space-between",
									alignItems: "baseline",
									marginBottom: 4,
								}}
							>
								<span style={{ fontWeight: 500, fontSize: 14 }}>{story.title}</span>
								<span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>
									{story.year}
								</span>
							</div>
							<div
								style={{
									fontSize: 11,
									fontWeight: 500,
									color: story.color,
									marginBottom: 6,
									letterSpacing: "0.04em",
								}}
							>
								{story.client}
							</div>
							<div
								style={{
									fontSize: 12,
									color: "var(--color-text-secondary)",
									lineHeight: 1.5,
									marginBottom: 8,
								}}
							>
								{story.description}
							</div>
							<div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
								{story.tags.map((tag) => (
									<span
										key={tag}
										style={{
											fontSize: 10,
											padding: "2px 7px",
											borderRadius: 8,
											background: `${story.color}18`,
											color: story.color,
										}}
									>
										{tag}
									</span>
								))}
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Services */}
			<div style={{ fontWeight: 500, fontSize: 14, marginBottom: 10 }}>Service verticals</div>
			{h3mServices.map((svc) => (
				<div
					key={svc.id}
					style={{
						marginBottom: 8,
						borderRadius: "var(--border-radius-lg)",
						border: "0.5px solid var(--color-border-tertiary)",
						overflow: "hidden",
					}}
				>
					<button
						type="button"
						onClick={() => setOpenService(openService === svc.id ? null : svc.id)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ")
								setOpenService(openService === svc.id ? null : svc.id);
						}}
						style={{
							padding: "12px 16px",
							cursor: "pointer",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
						}}
					>
						<div>
							<span style={{ fontWeight: 500, fontSize: 14 }}>{svc.title}</span>
							<span style={{ fontSize: 12, color: "var(--color-text-secondary)", marginLeft: 8 }}>
								{svc.subtitle}
							</span>
						</div>
						<span
							style={{
								fontSize: 14,
								color: "var(--color-text-tertiary)",
								transform: openService === svc.id ? "rotate(180deg)" : "none",
								transition: "transform 0.2s",
							}}
						>
							v
						</span>
					</button>
					{openService === svc.id && (
						<div
							style={{
								padding: "0 16px 14px",
								fontSize: 13,
								color: "var(--color-text-secondary)",
								lineHeight: 1.6,
							}}
						>
							{svc.description}
						</div>
					)}
				</div>
			))}

			{/* Connection to Portals strategy */}
			<div
				style={{
					marginTop: 16,
					padding: "12px 16px",
					borderRadius: "var(--border-radius-lg)",
					background: "var(--color-background-info)",
					border: "0.5px solid var(--color-border-info)",
				}}
			>
				<div
					style={{
						fontSize: 12,
						fontWeight: 500,
						color: "var(--color-text-info)",
						marginBottom: 4,
					}}
				>
					H3M × Portals strategic fit
				</div>
				<div style={{ fontSize: 12, color: "var(--color-text-info)", lineHeight: 1.6 }}>
					H3M client work (Kevin Hart, Justin Bieber, Ubisoft, Riot Games) = production-validated
					demand for exactly what Portals delivers: voice-first creation, real-time VFX at mobile
					scale, and persistent spatial scenes. H3M's Emmy/Clio/Cannes pedigree is the distribution
					channel that validates Portals' L3 positioning.
				</div>
			</div>
		</div>
	);
}

export function StrategicIntel() {
	const [tab, setTab] = useState(0);

	return (
		<div style={{ padding: "1rem 0" }}>
			<div
				style={{
					display: "flex",
					gap: 4,
					marginBottom: 20,
					borderBottom: "0.5px solid var(--color-border-tertiary)",
					paddingBottom: 8,
					overflowX: "auto",
				}}
			>
				{TABS.map((t, i) => (
					<button
						key={t}
						type="button"
						onClick={() => setTab(i)}
						style={{
							padding: "6px 14px",
							fontSize: 13,
							cursor: "pointer",
							border: "none",
							borderRadius: "var(--border-radius-md)",
							fontWeight: tab === i ? 500 : 400,
							background: tab === i ? "var(--color-background-secondary)" : "transparent",
							color: tab === i ? "var(--color-text-primary)" : "var(--color-text-secondary)",
							whiteSpace: "nowrap",
						}}
					>
						{t}
					</button>
				))}
			</div>
			{tab === 0 ? (
				<ConvergenceTab />
			) : tab === 1 ? (
				<MoatTab />
			) : tab === 2 ? (
				<ActionTab />
			) : tab === 3 ? (
				<HitListTab />
			) : (
				<H3mStoriesTab />
			)}
		</div>
	);
}
