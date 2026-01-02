import { GET } from '../route';
import { NextResponse } from 'next/server';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

const mockNextResponse = NextResponse as jest.Mocked<typeof NextResponse>;

describe('GET /api/health', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(process, 'uptime').mockReturnValue(123.456);
    jest.spyOn(Date.prototype, 'toISOString').mockReturnValue(
      '2024-01-01T00:00:00.000Z',
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return health check data', async () => {
    await GET();

    expect(mockNextResponse.json).toHaveBeenCalledWith(
      {
        status: 'ok',
        timestamp: '2024-01-01T00:00:00.000Z',
        uptime: 123.456,
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        service: 'vaulthub',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Content-Type': 'application/json',
        },
      },
    );
  });

  it('should return correct status code', async () => {
    await GET();

    expect(mockNextResponse.json).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        status: 200,
      }),
    );
  });

  it('should include cache control headers', async () => {
    await GET();

    expect(mockNextResponse.json).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        }),
      }),
    );
  });

  it('should include content type header', async () => {
    await GET();

    expect(mockNextResponse.json).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    );
  });

  it('should include uptime from process', async () => {
    const mockUptime = 999.999;
    jest.spyOn(process, 'uptime').mockReturnValue(mockUptime);

    await GET();

    expect(mockNextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        uptime: mockUptime,
      }),
      expect.any(Object),
    );
  });

  it('should include current timestamp', async () => {
    const mockTimestamp = '2024-12-31T23:59:59.999Z';
    jest
      .spyOn(Date.prototype, 'toISOString')
      .mockReturnValue(mockTimestamp);

    await GET();

    expect(mockNextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        timestamp: mockTimestamp,
      }),
      expect.any(Object),
    );
  });

  it('should include correct version', async () => {
    await GET();

    expect(mockNextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        version: '1.0.0',
      }),
      expect.any(Object),
    );
  });

  it('should include correct service name', async () => {
    await GET();

    expect(mockNextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        service: 'vaulthub',
      }),
      expect.any(Object),
    );
  });
});

