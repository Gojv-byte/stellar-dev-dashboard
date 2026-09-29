// tests/unit/scripts/type-check.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoist module factory so vi is available before import
const { main, resetOptions, EXIT_PASS, EXIT_SCRIPT_ERROR, validateNodeVersion, findTsc } =
  await vi.hoisted(async () => {
    const mod = await import('../../../scripts/type-check.mjs');
    return {
      main: mod.main,
      resetOptions: mod.resetOptions,
      EXIT_PASS: mod.EXIT_PASS,
      EXIT_SCRIPT_ERROR: mod.EXIT_SCRIPT_ERROR,
      validateNodeVersion: mod.validateNodeVersion,
      findTsc: mod.findTsc,
    };
  });

describe('type-check.mjs CLI', () => {
  beforeEach(() => {
    resetOptions();
  });

  it('--help exits with code 0', () => {
    const code = main(['--help']);
    expect(code).toBe(EXIT_PASS);
  });

  it('unknown option exits with code 2', () => {
    const code = main(['--bogus']);
    expect(code).toBe(EXIT_SCRIPT_ERROR);
  });

  it('rejects unsupported Node.js version', () => {
    const result = validateNodeVersion('16.0.0');
    expect(result.ok).toBe(false);
    expect(result.message).toContain('Minimum supported version is 18');
  });

  it('accepts the minimum supported Node.js version', () => {
    const result = validateNodeVersion('18.0.0');
    expect(result.ok).toBe(true);
  });

  it('primary flow: --dry-run returns exit 0', () => {
    const code = main(['--dry-run']);
    expect(code).toBe(EXIT_PASS);
  });

  it('failure path: missing tsconfig returns exit 2', () => {
    const code = main(['--project=does-not-exist.json']);
    expect(code).toBe(EXIT_SCRIPT_ERROR);
  });

  it('failure path: missing tsc returns exit 2', () => {
    const result = findTsc(() => false);
    expect(result.ok).toBe(false);
    expect(result.message).toContain('tsc');
  });
});
