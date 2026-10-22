"""Trilha instrumental original (eletrônica leve, 120 BPM) + efeitos sutis, sincronizados ao storyboard.
Tudo é sintetizado aqui: não há samples nem música de terceiros.

    python scripts/music.py            -> public/audio/trilha.wav (o render.sh converte para MP3)
Requer numpy, scipy e soundfile.
"""
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy import signal

SR = 48000
DUR = 28.0
BPM = 120
BEAT = 60 / BPM
CENAS = [2.0, 6.5, 11.0, 15.5, 20.0, 24.5]   # trocas de cena (todas caem em tempos inteiros da batida)
CLIQUES = [6.5 + 1.4, 6.5 + 1.88, 6.5 + 2.32, 15.5 + 2.25]
rng = np.random.default_rng(28)
N = int(DUR * SR)


def hz(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def tt(d):
    return np.arange(int(d * SR)) / SR


def add(dst, x, at, g=1.0, pan=0.0):
    i = int(round(at * SR))
    if x.ndim == 1:
        x = np.stack([x * np.cos((pan + 1) * np.pi / 4), x * np.sin((pan + 1) * np.pi / 4)], 1) * np.sqrt(2)
    a, b = max(0, i), min(len(dst), i + len(x))
    if a < b:
        dst[a:b] += x[a - i:b - i] * g


def filt(x, kind, f, order=2):
    return signal.sosfilt(signal.butter(order, f, btype=kind, fs=SR, output='sos'), x, axis=0)


def env(n, a, r):
    e = np.ones(n)
    na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


# ---- vozes
def kick():
    t = tt(0.4)
    f = 48 + 90 * np.exp(-t / 0.03)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.13) + filt(rng.standard_normal(len(t)), 'highpass', 2000) * np.exp(-t / 0.004) * 0.15


def hat(open_=False):
    t = tt(0.25 if open_ else 0.07)
    return filt(rng.standard_normal(len(t)), 'highpass', 8000) * np.exp(-t / (0.07 if open_ else 0.014))


def clap():
    t = tt(0.3)
    n = filt(rng.standard_normal(len(t)), 'bandpass', (1000, 6000))
    e = np.exp(-t / 0.08) * (1 + 0.6 * (np.sin(2 * np.pi * 90 * t) > 0) * (t < 0.03))
    return n * e * 0.6


def pluck(f, d=0.5):
    t = tt(d)
    x = np.sign(np.sin(2 * np.pi * f * t)) * 0.3 + np.sin(2 * np.pi * f * t) + 0.5 * np.sin(4 * np.pi * f * t)
    x = filt(x, 'lowpass', 3200)
    return x * np.exp(-t / 0.12) * (1 - np.exp(-t / 0.002))


def bass(f, d):
    t = tt(d)
    x = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)
    return x * env(len(t), 0.005, 0.05) * np.exp(-t / 0.35)


def pad(notas, d):
    t = tt(d)
    out = np.zeros((len(t), 2))
    for n in notas:
        for c, det in enumerate((-0.004, 0.004)):
            ph = rng.uniform(0, 6.28)
            out[:, c] += sum(np.sin(2 * np.pi * hz(n) * (1 + det) * h * t + ph * h) / h ** 1.6 for h in range(1, 6))
    out = filt(out, 'lowpass', 2400)
    return out * env(len(t), 0.25, 0.4)[:, None] / len(notas)


def whoosh(d=0.6):
    t = tt(d)
    n = rng.standard_normal(len(t))
    k = t / d
    lo, hi = filt(n, 'bandpass', (300, 1500)), filt(n, 'bandpass', (2000, 8000))
    x = (lo * (1 - k) + hi * k * 0.8) * np.sin(np.pi * k) ** 2
    pan = np.linspace(-0.6, 0.6, len(t))
    return np.stack([x * np.cos((pan + 1) * np.pi / 4), x * np.sin((pan + 1) * np.pi / 4)], 1) * 1.3


def riser(d=1.5):
    t = tt(d)
    n = filt(rng.standard_normal(len(t)), 'bandpass', (800, 7000))
    f = 200 + 900 * (t / d) ** 2
    return (n * 0.6 + 0.25 * np.sin(2 * np.pi * np.cumsum(f) / SR)) * (t / d) ** 2.5


def impact():
    t = tt(1.2)
    f = 36 + 70 * np.exp(-t / 0.05)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.35) + filt(rng.standard_normal(len(t)), 'lowpass', 3000) * np.exp(-t / 0.06) * 0.4


def click():
    t = tt(0.04)
    return np.sin(2 * np.pi * 2400 * t) * np.exp(-t / 0.006)


def bell(n):
    t = tt(2.5)
    f = hz(n)
    return np.sin(2 * np.pi * f * t + 1.6 * np.sin(2 * np.pi * f * 3.5 * t) * np.exp(-t / 0.4)) * np.exp(-t / 0.9) * (1 - np.exp(-t / 0.002))


def reverb(x, d=2.0, wet=0.25):
    n = int(d * SR)
    t = np.arange(n) / SR
    ir = filt(rng.standard_normal((n, 2)) * np.exp(-t / (d / 6))[:, None], 'lowpass', 5000)
    ir /= np.sqrt((ir ** 2).sum(0, keepdims=True))
    return x + wet * np.stack([signal.fftconvolve(x[:, c], ir[:, c])[:len(x)] for c in range(2)], 1)


def main():
    drums, music, padbus, fx = (np.zeros((N + SR * 3, 2)) for _ in range(4))
    prog = [[53, 57, 60, 64], [57, 60, 64, 67], [48, 52, 55, 59], [55, 59, 62, 64]]  # Fmaj7 Am7 Cmaj7 G6
    fim = CENAS[-1]
    for bar in range(int(DUR / (4 * BEAT)) + 1):
        t0 = bar * 4 * BEAT
        ch = prog[bar % 4] if t0 < fim else prog[0]
        add(padbus, pad(ch, 4 * BEAT + 0.6 if t0 < fim else DUR - t0 + 0.5), t0, 0.9)
        for b in range(8):
            tb = t0 + b * BEAT / 2
            if tb >= fim or tb >= DUR:
                break
            if tb >= CENAS[0]:
                add(music, pluck(hz(ch[[0, 2, 1, 3, 2, 1, 3, 0][b]] + 12)), tb, 0.32, pan=-0.3 if b % 2 else 0.3)
                add(music, bass(hz(ch[0] - 12), BEAT / 2 * 0.9), tb, 0.5 if b % 2 == 0 else 0.3)
        for b in range(4):
            tb = t0 + b * BEAT
            if tb < CENAS[0] or tb >= fim:
                continue
            add(drums, kick(), tb, 0.85)
            add(drums, hat(), tb + BEAT / 2, 0.22, pan=0.25)
            if b == 3:
                add(drums, hat(True), tb + BEAT / 2, 0.12, pan=-0.2)
            if b in (1, 3) and tb >= CENAS[1]:
                add(drums, clap(), tb, 0.32)
    # bombeamento leve do pad pela batida (sidechain)
    beat_env = np.ones(len(padbus))
    for k in range(int(CENAS[0] / BEAT), int(fim / BEAT)):
        i = int(k * BEAT * SR)
        m = int(0.35 * SR)
        beat_env[i:i + m] = np.minimum(beat_env[i:i + m], 0.45 + 0.55 * np.linspace(0, 1, m) ** 0.7)
    padbus *= beat_env[:, None]

    # sound design
    add(fx, riser(1.6), 0.4, 0.22)
    add(fx, bell(84), 0.95, 0.10); add(fx, bell(91), 1.07, 0.08)
    for c in CENAS:
        add(fx, whoosh(), c - 0.35, 0.16)
    add(fx, riser(1.4), CENAS[4] - 1.4, 0.18)
    add(fx, impact(), CENAS[4], 0.30)
    for c in CLIQUES:
        add(fx, click(), c, 0.10)
    add(fx, bell(84), fim + 2.3, 0.10); add(fx, bell(88), fim + 2.42, 0.08); add(fx, bell(91), fim + 2.54, 0.07)

    mix = drums * 0.55 + reverb(music, 1.8, 0.3) * 0.55 + padbus * 0.5 + reverb(fx, 1.6, 0.25)
    mix = mix[:N]
    fade = np.ones(N)
    fade[-int(0.7 * SR):] = np.linspace(1, 0, int(0.7 * SR)) ** 2
    fade[:int(0.02 * SR)] = np.linspace(0, 1, int(0.02 * SR))
    mix *= fade[:, None]
    mix = np.tanh(mix / np.max(np.abs(mix)) * 1.2) * 0.8
    out = Path(__file__).resolve().parent.parent / 'public' / 'audio' / 'trilha.wav'
    sf.write(out, mix.astype(np.float32), SR)
    print('trilha:', out)


if __name__ == '__main__':
    main()
