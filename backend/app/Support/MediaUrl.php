<?php

namespace App\Support;

use Illuminate\Support\Facades\Storage;

/**
 * A logo/cover/photo column can hold either a relative path from Filament's
 * FileUpload (a real partner's upload) or a full external URL (seeded demo
 * imagery) — this resolves either into a URL the app can load directly.
 */
class MediaUrl
{
    public static function resolve(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return str_starts_with($path, 'http://') || str_starts_with($path, 'https://')
            ? $path
            : Storage::disk('public')->url($path);
    }
}
