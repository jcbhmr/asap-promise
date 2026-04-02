export function isConstructor(value: unknown): boolean {
    try {
        new (value as any)();
        return true;
    } catch {
        return false;
    }
}