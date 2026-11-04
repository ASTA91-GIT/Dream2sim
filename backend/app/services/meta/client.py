import json
import logging
from typing import Dict, Any, List, Optional, AsyncGenerator
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


class MetaAPIClient:
    """
    Official Meta Model API Integration Layer.
    Base URL: https://api.meta.ai/v1
    Models:
    - Muse Spark: Natural language comprehension, entity extraction, structured outputs, tool calling
    - Muse Wonder: Deep analytical reasoning, scenario comparison, bottleneck root-cause analysis
    - Muse Image: Environment visualization and asset generation
    - Muse Voice Transcribe: Speech-to-text audio transcription
    - SAM 3.1: Segment Anything Model for road and vehicle segmentation
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: float = 30.0,
    ):
        self._api_key = api_key
        self.base_url = (base_url or settings.META_API_BASE_URL).rstrip("/")
        self.timeout = timeout

    @property
    def api_key(self) -> str:
        return self._api_key or settings.effective_meta_api_key

    @api_key.setter
    def api_key(self, value: str):
        self._api_key = value

    @property
    def is_configured(self) -> bool:
        key = self.api_key
        return bool(key and len(key.strip()) > 5)

    def _get_headers(self) -> Dict[str, str]:
        key = self.api_key
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
        }
        if key:
            headers["Authorization"] = f"Bearer {key}"
        return headers

    async def chat_completion(
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.2,
        tools: Optional[List[Dict[str, Any]]] = None,
        response_format: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Calls Meta Model API Chat Completions endpoint.
        Supports Structured Outputs (json_schema) and Tool Calling.
        """
        if not self.is_configured:
            raise ValueError(
                "Meta Model API key not configured. Please set 'META_API_KEY' in the backend environment."
            )

        endpoint = f"{self.base_url}/chat/completions"
        payload: Dict[str, Any] = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
        }

        if tools:
            payload["tools"] = tools
            payload["tool_choice"] = "auto"

        if response_format:
            payload["response_format"] = response_format

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    endpoint,
                    headers=self._get_headers(),
                    json=payload,
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"Meta API error [{e.response.status_code}]: {e.response.text}")
                raise RuntimeError(
                    f"Meta API HTTP {e.response.status_code}: {e.response.text}"
                ) from e
            except httpx.RequestError as e:
                logger.error(f"Meta API network failure: {str(e)}")
                raise RuntimeError(f"Meta API connection error: {str(e)}") from e

    async def stream_chat_completion(
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.2,
    ) -> AsyncGenerator[str, None]:
        """
        Streams response chunks from Meta Model API.
        """
        if not self.is_configured:
            raise ValueError(
                "Meta Model API key not configured. Please set MODEL_API_KEY."
            )

        endpoint = f"{self.base_url}/chat/completions"
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "stream": True,
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            async with client.stream(
                "POST",
                endpoint,
                headers=self._get_headers(),
                json=payload,
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line:
                        continue
                    if line.startswith("data: "):
                        data_str = line[6:].strip()
                        if data_str == "[DONE]":
                            break
                        try:
                            data_json = json.loads(data_str)
                            delta = data_json["choices"][0].get("delta", {})
                            content = delta.get("content", "")
                            if content:
                                yield content
                        except json.JSONDecodeError:
                            continue

    async def transcribe_audio(
        self,
        audio_bytes: bytes,
        filename: str = "voice_input.wav",
        language: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Transcribes audio using Muse Voice Transcribe.
        """
        if not self.is_configured:
            raise ValueError(
                "Meta Model API key not configured. Please set MODEL_API_KEY."
            )

        endpoint = f"{self.base_url}/audio/transcriptions"
        headers = {}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        files = {"file": (filename, audio_bytes, "audio/wav")}
        data: Dict[str, Any] = {"model": settings.MUSE_VOICE_MODEL}
        if language:
            data["language"] = language

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                endpoint,
                headers=headers,
                data=data,
                files=files,
            )
            response.raise_for_status()
            return response.json()

    async def segment_image_sam(
        self,
        image_bytes: bytes,
        confidence_threshold: float = 0.5,
    ) -> Dict[str, Any]:
        """
        Uses SAM 3.1 for image segmentation and object localization on traffic scenes.
        """
        if not self.is_configured:
            raise ValueError(
                "Meta Model API key not configured. Please set MODEL_API_KEY."
            )

        endpoint = f"{self.base_url}/vision/segmentation"
        headers = {}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        files = {"image": ("scene.jpg", image_bytes, "image/jpeg")}
        data = {
            "model": settings.SAM_MODEL,
            "threshold": str(confidence_threshold),
            "target_classes": json.dumps(["car", "bus", "truck", "motorcycle", "pedestrian", "traffic_light", "lane"]),
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                endpoint,
                headers=headers,
                data=data,
                files=files,
            )
            response.raise_for_status()
            return response.json()

    async def generate_image_muse(
        self,
        prompt: str,
        size: str = "1024x1024",
    ) -> Dict[str, Any]:
        """
        Uses Muse Image to generate supporting environment visual representations.
        """
        if not self.is_configured:
            raise ValueError(
                "Meta Model API key not configured. Please set MODEL_API_KEY."
            )

        endpoint = f"{self.base_url}/images/generations"
        payload = {
            "model": settings.MUSE_IMAGE_MODEL,
            "prompt": prompt,
            "size": size,
            "n": 1,
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                endpoint,
                headers=self._get_headers(),
                json=payload,
            )
            response.raise_for_status()
            return response.json()
