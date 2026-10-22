"""Gera a narração (um WAV por fala) e o arquivo de tempos usado pela animação.

Uso:
    python scripts/tts.py --modelos <pasta com vits-piper-pt_BR-*>

Saídas:
    audio/falas/sNN.wav        uma fala por arquivo
    audio/narracao.wav         todas as falas na linha do tempo final
    composition/timing.js      window.TIMING = {...} (lido pelo index.html)
    out/aea-nova-jornada.srt   legendas sincronizadas
"""

import argparse
import json
import re
from pathlib import Path

import numpy as np
import sherpa_onnx
import soundfile as sf

RAIZ = Path(__file__).resolve().parent.parent
SR_SAIDA = 48000


def carregar_tts(pasta_modelos: Path, voz: str) -> sherpa_onnx.OfflineTts:
    pasta = pasta_modelos / f"vits-piper-{voz}"
    cfg = sherpa_onnx.OfflineTtsConfig(
        model=sherpa_onnx.OfflineTtsModelConfig(
            vits=sherpa_onnx.OfflineTtsVitsModelConfig(
                model=str(pasta / f"{voz}.onnx"),
                tokens=str(pasta / "tokens.txt"),
                data_dir=str(pasta / "espeak-ng-data"),
                noise_scale=0.6,
                noise_scale_w=0.8,
            ),
            num_threads=4,
        ),
        max_num_sentences=1,
    )
    return sherpa_onnx.OfflineTts(cfg)


def aplicar_pronuncia(texto: str, pronuncia: dict) -> str:
    return re.sub(r"\{(\w+)\}", lambda m: pronuncia.get(m.group(1), m.group(1)), texto)


def reamostrar(amostras: np.ndarray, sr: int) -> np.ndarray:
    if sr == SR_SAIDA:
        return amostras
    n = int(round(len(amostras) * SR_SAIDA / sr))
    x_antigo = np.linspace(0, 1, len(amostras), endpoint=False)
    x_novo = np.linspace(0, 1, n, endpoint=False)
    return np.interp(x_novo, x_antigo, amostras).astype(np.float32)


def aparar_silencio(amostras: np.ndarray, limiar: float = 0.004) -> np.ndarray:
    ativo = np.where(np.abs(amostras) > limiar)[0]
    if len(ativo) == 0:
        return amostras
    margem = int(0.08 * SR_SAIDA)
    return amostras[max(0, ativo[0] - margem): ativo[-1] + margem]


def srt_tempo(t: float) -> str:
    ms = int(round(t * 1000))
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--modelos", type=Path, required=True)
    args = ap.parse_args()

    roteiro = json.loads((RAIZ / "narracao.json").read_text(encoding="utf-8"))
    tts = carregar_tts(args.modelos, roteiro["voz"])
    pasta_falas = RAIZ / "audio" / "falas"
    pasta_falas.mkdir(parents=True, exist_ok=True)

    cursor = roteiro["abertura"]
    segmentos, trilha = [], []
    for seg in roteiro["segmentos"]:
        texto = aplicar_pronuncia(seg["fala"], roteiro["pronuncia"])
        audio = tts.generate(texto, sid=0, speed=roteiro["velocidade"])
        amostras = aparar_silencio(reamostrar(np.asarray(audio.samples, dtype=np.float32), audio.sample_rate))
        sf.write(pasta_falas / f"{seg['id']}.wav", amostras, SR_SAIDA)
        dur = len(amostras) / SR_SAIDA
        segmentos.append({"id": seg["id"], "cena": seg["cena"], "inicio": round(cursor, 3),
                          "duracao": round(dur, 3), "legenda": seg["legenda"], "fala": texto})
        trilha.append((cursor, amostras))
        cursor += dur + seg["pausa"]

    total = cursor
    narracao = np.zeros(int(np.ceil(total * SR_SAIDA)) + SR_SAIDA, dtype=np.float32)
    for inicio, amostras in trilha:
        i = int(round(inicio * SR_SAIDA))
        narracao[i:i + len(amostras)] += amostras
    narracao = narracao[: int(np.ceil(total * SR_SAIDA))]
    pico = np.max(np.abs(narracao))
    if pico > 0:
        narracao *= 0.89 / pico
    sf.write(RAIZ / "audio" / "narracao.wav", narracao, SR_SAIDA)

    timing = {"duracao": round(total, 3), "segmentos": segmentos}
    (RAIZ / "composition" / "timing.js").write_text(
        "window.TIMING = " + json.dumps(timing, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")

    linhas = []
    for n, s in enumerate(segmentos, 1):
        linhas += [str(n), f"{srt_tempo(s['inicio'])} --> {srt_tempo(s['inicio'] + s['duracao'])}", s["legenda"], ""]
    (RAIZ / "out").mkdir(exist_ok=True)
    (RAIZ / "out" / "aea-nova-jornada.srt").write_text("\n".join(linhas), encoding="utf-8")

    for s in segmentos:
        print(f"{s['id']}  {s['inicio']:6.2f}s  +{s['duracao']:5.2f}s  {s['cena']}")
    print(f"duração total: {total:.2f}s")


if __name__ == "__main__":
    main()
