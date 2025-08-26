import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

if (!global.TextEncoder) global.TextEncoder = TextEncoder;
if (!global.TextDecoder) global.TextDecoder = TextDecoder;

// 👇 Fake stream classes so msw doesn’t crash
if (!global.TransformStream) global.TransformStream = class {};
if (!global.ReadableStream) global.ReadableStream = class {};
if (!global.WritableStream) global.WritableStream = class {};
