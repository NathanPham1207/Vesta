import { BASE_URL, COMMON_HEADERS } from './apiConfig';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ScanAsset = {
  uri?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  file?: File;
};

export type ScanFailureReason =
  | 'non_food_image'
  | 'unclear_image'
  | 'no_food_items_detected';

export type ScanImageType =
  | 'receipt'
  | 'pantry'
  | 'grocery'
  | 'food_product';

export type ScanItem = {
  name: string | null;
  quantity: number | null;
  unit: string | null;
  price: number | null;
  category: string;
  imageUrl?: string | null;
};

export type ScanAnalysisResult = {
  isFoodRelated: true;
  imageType: ScanImageType;
  storeName: string | null;
  purchaseDate: string | null;
  items: ScanItem[];
};

type ApiSuccess<T> = {
  success: true;
  data: T;
};

type LegacyApiSuccess = {
  success: true;
  items?: unknown;
  message?: string;
};

type ApiFailure = {
  success: false;
  message?: string;
  reason?: ScanFailureReason | string;
  data?: unknown;
};

export type ScanReceiptResponse =
  | ApiSuccess<ScanAnalysisResult>
  | ApiFailure;

// ─── Helpers ─────────────────────────────────────────────────────────────────

// FormData on React Native requires a shape object instead of a Blob.
// `as unknown as Blob` satisfies the TS overload without using `as any`.
type RNFileShape = { uri: string; name: string; type: string };

function toFormDataFile(shape: RNFileShape): Blob {
  return shape as unknown as Blob;
}

function getUploadHeaders(): Record<string, string> {
  const headers = { ...(COMMON_HEADERS as Record<string, string>) };
  // Let the runtime set Content-Type with the correct multipart boundary.
  delete headers['Content-Type'];
  delete headers['content-type'];
  return headers;
}

function isApiSuccess(value: unknown): value is ApiSuccess<ScanAnalysisResult> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    (value as { success: unknown }).success === true &&
    'data' in value
  );
}

function isApiFailure(value: unknown): value is ApiFailure {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    (value as { success: unknown }).success === false
  );
}

function isLegacyApiSuccess(value: unknown): value is LegacyApiSuccess {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    (value as { success: unknown }).success === true &&
    'items' in value
  );
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!response.ok) {
    // Try to extract the server's error message from the JSON body
    // so the caller gets a meaningful message instead of raw status text
    let serverMessage: string | null = null;
    try {
      const json = JSON.parse(text) as { message?: unknown };
      if (typeof json.message === 'string') serverMessage = json.message;
    } catch {
      // JSON parse failed — fall through to generic message
    }
    throw new Error(serverMessage ?? `Request failed: ${response.status}`);
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Server returned invalid JSON.');
  }
}

// ─── API ─────────────────────────────────────────────────────────────────────

export async function scanReceipt(asset: ScanAsset): Promise<ScanReceiptResponse> {
  const fileUri = asset.uri;
  const fileName = asset.fileName || `receipt-${Date.now()}.jpg`;
  const mimeType = asset.mimeType || 'image/jpeg';

  if (!fileUri && !asset.file) {
    throw new Error('Missing image source: provide either a URI or a File object.');
  }

  const formData = new FormData();

  if (asset.file) {
    formData.append('receipt', asset.file);
  } else {
    formData.append(
      'receipt',
      toFormDataFile({ uri: fileUri!, name: fileName, type: mimeType }),
    );
  }

  const response = await fetch(`${BASE_URL}/scan/receipt`, {
    method: 'POST',
    headers: getUploadHeaders(),
    body: formData,
  });

  const parsed = await parseResponse<unknown>(response);

  if (isApiSuccess(parsed)) return parsed;
  if (isApiFailure(parsed)) return parsed;
  if (isLegacyApiSuccess(parsed)) {
    const rawItems = Array.isArray(parsed.items) ? parsed.items : [];

    return {
      success: true,
      data: {
        isFoodRelated: true,
        imageType: 'receipt',
        storeName: 'Scanned receipt',
        purchaseDate: new Date().toISOString(),
        items: rawItems.map((item) => {
          const row = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
          return {
            name: typeof row.name === 'string' ? row.name : null,
            quantity: typeof row.quantity === 'number' ? row.quantity : 1,
            unit: typeof row.unit === 'string' ? row.unit : null,
            price: typeof row.price === 'number' ? row.price : null,
            category: typeof row.category === 'string' ? row.category : 'Misc',
            imageUrl: typeof row.imageUrl === 'string' ? row.imageUrl : null,
          };
        }),
      },
    };
  }

  throw new Error(`Unexpected response format from scan endpoint (status ${response.status}).`);
}
