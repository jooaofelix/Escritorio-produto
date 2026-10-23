# Trilha ambiente original: pad quente + arpejo suave + baixo. Determinística.
import numpy as np, soundfile as sf, sys
SR = 48000
DUR = float(sys.argv[2])
n = int(SR * DUR)
t = np.arange(n) / SR
L = np.zeros(n); R = np.zeros(n)
def hz(m): return 440 * 2 ** ((m - 69) / 12)
BAR = 3.0  # 80 bpm, 4 tempos
# Fmaj7, Am7, Dm9, Bbmaj7(9)
chords = [[53, 57, 60, 64, 69], [57, 60, 64, 67, 72], [50, 57, 60, 64, 65], [46, 53, 57, 62, 65]]
bass = [41, 45, 38, 46]
def env(length, a, r):
    e = np.ones(length)
    ai = int(a * SR); ri = int(r * SR)
    e[:ai] = np.linspace(0, 1, ai) ** 2
    e[-ri:] *= np.linspace(1, 0, ri) ** 2
    return e
i = 0; start = 0.0
while start < DUR:
    ch = chords[i % 4]
    s0 = int(start * SR); length = min(int((BAR + 1.6) * SR), n - s0)
    if length <= SR: break
    tt = np.arange(length) / SR
    e = env(length, 1.2, 1.6)
    for k, m in enumerate(ch):
        for det, pan in ((-0.07, 0.3), (0.07, 0.7)):
            f = hz(m + 12) * (1 + det / 100 * 1.0)
            w = np.sin(2 * np.pi * f * tt) + 0.18 * np.sin(4 * np.pi * f * tt)
            w *= 0.035 * e * (1 + 0.15 * np.sin(2 * np.pi * 0.2 * tt + k))
            L[s0:s0 + length] += w * (1 - pan); R[s0:s0 + length] += w * pan
    fb = hz(bass[i % 4])
    wb = 0.09 * np.sin(2 * np.pi * fb * tt) * env(length, 0.4, 1.6)
    L[s0:s0 + length] += wb; R[s0:s0 + length] += wb
    # arpejo em colcheias (0,375 s), notas do acorde uma oitava acima
    pattern = [0, 2, 3, 4, 3, 2, 1, 2]
    for j, p in enumerate(pattern):
        ns = start + j * 0.375
        if ns >= DUR: break
        a0 = int(ns * SR); ln = min(int(1.4 * SR), n - a0)
        if ln <= 0: continue
        ta = np.arange(ln) / SR
        f = hz(ch[p] + 24)
        w = (np.sin(2 * np.pi * f * ta) + 0.25 * np.sin(4 * np.pi * f * ta) * np.exp(-ta * 6)) * np.exp(-ta * 3.2)
        w *= np.minimum(1, ta / 0.004) * 0.045 * (0.85 if j % 2 else 1.0)
        pan = 0.35 + 0.3 * ((j * 3) % 4) / 3
        L[a0:a0 + ln] += w * (1 - pan); R[a0:a0 + ln] += w * pan
    start += BAR; i += 1
st = np.stack([L, R], 1)
st /= np.max(np.abs(st)) * 1.25
sf.write(sys.argv[1], st, SR)
