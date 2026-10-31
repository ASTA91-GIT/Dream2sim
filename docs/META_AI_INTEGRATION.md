# Meta Model API Integration Guide

This document details how Dream2Sim integrates with Meta's official Model API (`https://api.meta.ai/v1`).

## Model Responsibilities

| Model | Role in Dream2Sim | API Interface |
|---|---|---|
| **Muse Spark** | Primary simulation architect. Understands user prompts, extracts physical entities/constraints, and outputs validated `SimulationConfig`. | `/chat/completions` (Structured Outputs & Tool Calling) |
| **Muse Wonder** | Deep analytical reasoning. Evaluates actual calculated simulation metrics, explains bottlenecks, and proposes optimization splits. | `/chat/completions` (Reasoning Controls) |
| **Muse Voice Transcribe** | Speech-to-text. Transcribes spoken microphone descriptions into text input. | `/audio/transcriptions` |
| **SAM 3.1** | Segment Anything Model. Analyzes uploaded aerial or street intersection photos to detect vehicles and road boundaries. | `/vision/segmentation` |
| **Muse Image** | Generates supporting environmental illustrations and visual assets. | `/images/generations` |

## Controlled Tool Calling

Muse Spark is connected to safe backend functions:
- `validate_simulation_config`
- `run_simulation`
- `compare_scenarios`
- `optimize_signal_timing`

The LLM never executes arbitrary code directly.

## Configuration & Credentials

Set the following environment variable in `.env`:

```env
MODEL_API_KEY=your_meta_model_api_key_here
META_API_BASE_URL=https://api.meta.ai/v1
```

When `MODEL_API_KEY` is not present, Dream2Sim automatically functions in high-fidelity deterministic engine mode, allowing full testing of the platform without credential blockers.
