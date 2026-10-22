"""Trilha original, efeitos sonoros e mixagem final (tudo sintetizado, sem samples de terceiros).

Uso (depois de tts.py e render.mjs, que gera audio/sfx.json):
    python scripts/audio.py

Saídas: audio/trilha.wav, audio/efeitos.wav, audio/mix.wav (48 kHz, estéreo)
"""

import json
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy import signal

RAIZ = Path(__file__).resolve().parent.parent
SR = 48000
rng = np.random.default_rng(141)

BPM = 100
BEAT = 60 / BPM
BAR = 4 * BEAT


def midi(n: float) -> float:
    return 440.0 * 2 ** ((n - 69) / 12)


def tempo(dur: float) -> np.ndarray:
    return np.arange(int(dur * SR)) / SR


def adsr(n: int, a: float, r: float) -> np.ndarray:
    env = np.ones(n)
    na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    if na:
        env[:na] = np.linspace(0, 1, na) ** 1.5
    if nr:
        env[-nr:] *= np.linspace(1, 0, nr) ** 1.5
    return env


def somar(dest: np.ndarray, sinal: np.ndarray, inicio: float, ganho: float = 1.0, pan: float = 0.0) -> None:
    """Soma um sinal mono (ou estéreo) em dest (n, 2) a partir de `inicio` segundos."""
    i = int(round(inicio * SR))
    if i >= len(dest) or i + len(sinal) <= 0:
        return
    if sinal.ndim == 1:
        esq, dir_ = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        sinal = np.stack([sinal * esq, sinal * dir_], axis=1) * np.sqrt(2)
    a, b = max(i, 0), min(len(dest), i + len(sinal))
    dest[a:b] += sinal[a - i:b - i] * ganho


def filtro(x: np.ndarray, tipo: str, freq, ordem: int = 2) -> np.ndarray:
    sos = signal.butter(ordem, freq, btype=tipo, fs=SR, output="sos")
    return signal.sosfilt(sos, x, axis=0)


def reverb(x: np.ndarray, dur: float = 2.2, umido: float = 0.25) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    ir = rng.standard_normal((n, 2)) * np.exp(-t / (dur / 6.5))[:, None]
    ir = filtro(ir, "lowpass", 5200)
    ir[: int(0.012 * SR)] = 0
    ir /= np.sqrt(np.sum(ir ** 2, axis=0, keepdims=True))
    molhado = np.stack([signal.fftconvolve(x[:, c], ir[:, c])[: len(x)] for c in range(2)], axis=1)
    return x + molhado * umido


# ---------------------------------------------------------------- instrumentos
def pad(freqs, dur: float) -> np.ndarray:
    t = tempo(dur)
    out = np.zeros((len(t), 2))
    for k, f in enumerate(freqs):
        for c, det in enumerate((-0.0035, 0.0035)):
            fase = rng.uniform(0, 2 * np.pi)
            onda = sum(np.sin(2 * np.pi * f * (1 + det) * h * t + fase * h) / h ** 1.7 for h in range(1, 6))
            out[:, c] += onda * (1 + 0.12 * np.sin(2 * np.pi * 0.23 * t + k))
    out = filtro(out, "lowpass", 2600)
    return out * adsr(len(t), 0.7, 0.9)[:, None] / len(freqs)


def pluck(f: float, dur: float = 0.9) -> np.ndarray:
    t = tempo(dur)
    env = np.exp(-t / 0.2) * (1 - np.exp(-t / 0.002))
    return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)) * env


def baixo(f: float, dur: float) -> np.ndarray:
    t = tempo(dur)
    onda = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(4 * np.pi * f * t)
    return onda * adsr(len(t), 0.01, 0.12) * np.exp(-t / 1.6)


def bumbo() -> np.ndarray:
    t = tempo(0.45)
    f = 48 + 75 * np.exp(-t / 0.035)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.16)


def palma() -> np.ndarray:
    t = tempo(0.3)
    ruido = filtro(rng.standard_normal(len(t)), "bandpass", (900, 5000))
    return ruido * np.exp(-t / 0.07) * 0.6 + np.sin(2 * np.pi * 190 * t) * np.exp(-t / 0.05) * 0.3


def chimbal() -> np.ndarray:
    t = tempo(0.08)
    return filtro(rng.standard_normal(len(t)), "highpass", 7000) * np.exp(-t / 0.018)


# ---------------------------------------------------------------- efeitos
def whoosh(dur: float = 0.75) -> np.ndarray:
    n = int(dur * SR)
    t = np.arange(n) / SR
    ruido = rng.standard_normal(n)
    graves = filtro(ruido, "bandpass", (250, 1200))
    agudos = filtro(ruido, "bandpass", (1500, 7000))
    mistura = np.clip(t / dur * 1.4, 0, 1)
    env = np.sin(np.pi * np.clip(t / dur, 0, 1)) ** 2
    mono = (graves * (1 - mistura) + agudos * mistura * 0.8) * env
    pan = np.linspace(-0.7, 0.7, n)
    return np.stack([mono * np.cos((pan + 1) * np.pi / 4), mono * np.sin((pan + 1) * np.pi / 4)], axis=1) * 1.4


def pop() -> np.ndarray:
    t = tempo(0.18)
    f = 520 + 420 * (1 - np.exp(-t / 0.02))
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.045) * (1 - np.exp(-t / 0.001))


def tick() -> np.ndarray:
    t = tempo(0.05)
    return (np.sin(2 * np.pi * 2600 * t) * 0.6 + filtro(rng.standard_normal(len(t)), "highpass", 3000) * 0.4) * np.exp(-t / 0.008)


def impacto() -> np.ndarray:
    t = tempo(1.4)
    f = 34 + 60 * np.exp(-t / 0.06)
    corpo = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.4)
    ataque = filtro(rng.standard_normal(len(t)), "lowpass", 2500) * np.exp(-t / 0.05) * 0.5
    return corpo + ataque


def sino(notas=(81, 88), espaco: float = 0.11) -> np.ndarray:
    t = tempo(2.6)
    out = np.zeros(len(t) + int(espaco * SR * len(notas)))
    for k, n in enumerate(notas):
        f = midi(n)
        mod = np.sin(2 * np.pi * f * 3.5 * t) * 2.2 * np.exp(-t / 0.5)
        som = np.sin(2 * np.pi * f * t + mod) * np.exp(-t / 0.9) * (1 - np.exp(-t / 0.002))
        i = int(k * espaco * SR)
        out[i:i + len(t)] += som * (0.8 if k else 1.0)
    return out * 0.5


def riser(dur: float = 1.2) -> np.ndarray:
    t = tempo(dur)
    ruido = filtro(rng.standard_normal(len(t)), "bandpass", (600, 6000))
    f = 180 + 700 * (t / dur) ** 2
    tom = np.sin(2 * np.pi * np.cumsum(f) / SR) * 0.3
    return (ruido * 0.5 + tom) * (t / dur) ** 2.2


def alerta() -> np.ndarray:
    t = tempo(0.9)
    a = np.sin(2 * np.pi * 988 * t) + 0.4 * np.sin(2 * np.pi * 1976 * t)
    out = a * np.exp(-t / 0.18)
    atraso = int(0.16 * SR)
    out[atraso:] += (a * np.exp(-t / 0.22))[: len(out) - atraso] * 0.7
    return out * 0.5


EFEITOS = {"whoosh": (whoosh, 0.20), "pop": (pop, 0.16), "tick": (tick, 0.14), "impact": (impacto, 0.55),
           "chime": (sino, 0.30), "riser": (riser, 0.18), "alert": (alerta, 0.20)}


# ---------------------------------------------------------------- trilha
def trilha(timing: dict, total: float) -> np.ndarray:
    seg = {s["id"]: s["inicio"] for s in timing["segmentos"]}
    out_pad = np.zeros((int(total * SR) + SR * 3, 2))
    out_ritmo = np.zeros_like(out_pad)
    out_arp = np.zeros_like(out_pad)

    acordes = [
        [50, 57, 64, 66, 69],   # D(add9)
        [47, 54, 57, 62, 66],   # Bm7
        [43, 50, 54, 59, 62],   # Gmaj7
        [45, 52, 57, 61, 64],   # A
    ]
    inicio_full = seg["s03"] - 0.35
    respiro = (seg["s14"] - 0.4, seg["s15"] - 0.4)
    fim = seg["s25"] - 0.5

    # alinha a grade rítmica para o primeiro tempo forte cair na revelação da marca
    origem = inicio_full - BAR * np.ceil(inicio_full / BAR)
    n_comp = int(np.ceil((total - origem) / BAR)) + 1
    for c in range(n_comp):
        t0 = origem + c * BAR
        if t0 + BAR < 0 or t0 > total:
            continue
        ac = acordes[c % 4]
        if t0 >= fim - 0.01:
            ac = acordes[0]
        dur_pad = BAR + 1.0 if t0 < fim else total - t0 + 0.5
        somar(out_pad, pad([midi(n) for n in ac], dur_pad), t0, 0.9)
        if t0 >= fim:
            somar(out_pad, pad([midi(n + 12) for n in ac[1:]], dur_pad), t0, 0.35)
            break

        cheio = t0 >= inicio_full - 0.01
        em_respiro = respiro[0] <= t0 < respiro[1]
        if not cheio:
            continue
        # arpejo em colcheias
        padrao = [0, 2, 4, 3, 1, 3, 4, 2]
        for k in range(8):
            tt = t0 + k * BEAT / 2
            if tt >= fim:
                break
            nota = ac[1:][padrao[k] % 4] + 12
            somar(out_arp, pluck(midi(nota)), tt, 0.5 if not em_respiro else 0.35, pan=0.35 if k % 2 else -0.35)
        # baixo
        for b, d in ((0, 1.4), (1.5, 0.4), (2, 1.4), (3.5, 0.4)):
            tt = t0 + b * BEAT
            if tt < fim:
                somar(out_ritmo, baixo(midi(ac[0] - 12), d * BEAT), tt, 0.55)
        if em_respiro:
            continue
        for b in range(4):
            tt = t0 + b * BEAT
            if tt >= fim:
                break
            if b in (0, 2):
                somar(out_ritmo, bumbo(), tt, 0.75)
            if b in (1, 3) and t0 >= seg["s05"] - 0.5:
                somar(out_ritmo, palma(), tt, 0.32, pan=0.1)
            somar(out_ritmo, chimbal(), tt + BEAT / 2, 0.16, pan=0.3)

    # abertura: tique-taque do relógio sob o pad
    for k in range(int(inicio_full / 0.5)):
        somar(out_ritmo, tick(), 0.4 + k * 0.5, 0.18 if k % 2 else 0.24, pan=-0.2 if k % 2 else 0.2)

    atraso = int(BEAT * 0.75 * SR)
    eco = np.zeros_like(out_arp)
    eco[atraso:] = out_arp[:-atraso] * 0.32
    eco[:, [0, 1]] = eco[:, [1, 0]]
    musica = out_pad * 0.55 + reverb(out_arp + eco, 2.4, 0.35) * 0.35 + out_ritmo * 0.6
    return musica[: int(total * SR)]


def envelope_voz(voz: np.ndarray) -> np.ndarray:
    nivel = np.abs(voz)
    janela = int(0.04 * SR)
    nivel = np.convolve(nivel, np.ones(janela) / janela, mode="same")
    alvo = np.clip(nivel / 0.04, 0, 1)
    # ataque rápido, liberação lenta
    env = np.zeros_like(alvo)
    a, r = np.exp(-1 / (0.03 * SR)), np.exp(-1 / (0.45 * SR))
    acc = 0.0
    passo = 64
    for i in range(0, len(alvo), passo):
        x = alvo[i:i + passo].max()
        coef = (a if x > acc else r) ** passo
        acc = x + (acc - x) * coef
        env[i:i + passo] = acc
    return env


def main() -> None:
    timing_js = (RAIZ / "composition" / "timing.js").read_text(encoding="utf-8")
    timing = json.loads(timing_js[timing_js.index("{"): timing_js.rindex("}") + 1])
    cues = json.loads((RAIZ / "audio" / "sfx.json").read_text(encoding="utf-8"))["cues"]
    total = timing["duracao"]
    n = int(total * SR)

    voz, sr = sf.read(RAIZ / "audio" / "narracao.wav", dtype="float64")
    assert sr == SR
    voz = np.pad(voz, (0, max(0, n - len(voz))))[:n]
    voz = filtro(voz, "highpass", 80)
    voz_st = np.stack([voz, voz], axis=1)

    musica = trilha(timing, total)
    musica = musica[:n]
    duck = 1 - 0.6 * envelope_voz(voz)
    musica *= duck[:, None]

    efeitos = np.zeros((n + SR * 3, 2))
    for c in cues:
        fn, ganho = EFEITOS[c["type"]]
        som = fn()
        inicio = c["t"] - (1.1 if c["type"] == "riser" else 0)
        somar(efeitos, som, inicio, ganho * c["gain"])
    efeitos = reverb(efeitos, 1.6, 0.18)[:n]

    # fade de saída
    fade = np.ones(n)
    nf = int(1.6 * SR)
    fade[-nf:] = np.linspace(1, 0, nf) ** 2
    def norm(x, pico):
        return x * (pico / max(1e-9, np.max(np.abs(x))))

    musica = norm(musica, 0.27) * fade[:, None]
    efeitos = norm(efeitos, 0.45) * fade[:, None]
    mix = voz_st * 0.9 + musica + efeitos
    mix = np.tanh(mix * 1.1) / np.tanh(1.1)

    pasta = RAIZ / "audio"
    sf.write(pasta / "trilha.wav", musica.astype(np.float32), SR)
    sf.write(pasta / "efeitos.wav", efeitos.astype(np.float32), SR)
    sf.write(pasta / "mix.wav", mix.astype(np.float32), SR)
    print(f"mix: {total:.2f}s, pico {np.max(np.abs(mix)):.2f}")


if __name__ == "__main__":
    main()
