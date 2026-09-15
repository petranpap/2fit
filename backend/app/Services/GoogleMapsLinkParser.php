<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Lets a non-technical gym/trainer/shop owner set their location by pasting
 * a Google Maps link instead of typing raw latitude/longitude — see the
 * Filament forms that use this via HasLocationFields.
 */
class GoogleMapsLinkParser
{
    /**
     * Only ever follow redirects for Google's own short-link domains — this
     * takes a URL straight from a form field, so anything else would make
     * this an open server-side-request proxy.
     */
    private const RESOLVABLE_HOSTS = ['goo.gl', 'maps.app.goo.gl'];

    /**
     * @return array{lat: float, lng: float}|null
     */
    public function parse(string $url): ?array
    {
        $url = trim($url);

        if ($url === '') {
            return null;
        }

        if ($coordinates = $this->extractCoordinates($url)) {
            return $coordinates;
        }

        // A mobile "Share" link is usually a short link with no coordinates
        // in it at all — resolve the redirect to get the real URL first.
        $host = parse_url($url, PHP_URL_HOST);

        if ($host && in_array(strtolower($host), self::RESOLVABLE_HOSTS, true)) {
            $resolved = $this->resolveRedirect($url);

            if ($resolved) {
                return $this->extractCoordinates($resolved);
            }
        }

        return null;
    }

    private function resolveRedirect(string $url): ?string
    {
        try {
            $response = Http::timeout(5)
                ->withOptions(['allow_redirects' => ['track_redirects' => true]])
                ->get($url);

            return (string) $response->effectiveUri() ?: null;
        } catch (\Throwable $e) {
            Log::info('GoogleMapsLinkParser: failed to resolve short link', ['url' => $url, 'error' => $e->getMessage()]);

            return null;
        }
    }

    /**
     * @return array{lat: float, lng: float}|null
     */
    private function extractCoordinates(string $url): ?array
    {
        // The exact dropped-pin location, when present: "!3d{lat}!4d{lng}".
        if (preg_match('/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/', $url, $matches)) {
            return ['lat' => (float) $matches[1], 'lng' => (float) $matches[2]];
        }

        // The map's centre point: "/@{lat},{lng},{zoom}z".
        if (preg_match('/@(-?\d+\.\d+),(-?\d+\.\d+)/', $url, $matches)) {
            return ['lat' => (float) $matches[1], 'lng' => (float) $matches[2]];
        }

        // A plain "?q={lat},{lng}" search link.
        if (preg_match('/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/', $url, $matches)) {
            return ['lat' => (float) $matches[1], 'lng' => (float) $matches[2]];
        }

        return null;
    }
}
