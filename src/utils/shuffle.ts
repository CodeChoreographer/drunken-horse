export function shuffle<T>(arr: T[], seed = Date.now()): T[] {
    let x = seed | 0;
    const rnd = () => ((x ^= x << 13), (x ^= x >>> 17), (x ^= x << 5), (x >>> 0) / 0xFFFFFFFF);

    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
