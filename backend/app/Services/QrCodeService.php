<?php

namespace App\Services;

use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;

class QrCodeService
{
    /**
     * SVG markup for a QR code encoding $data. SVG is deliberately used
     * instead of PNG — bacon/bacon-qr-code's SVG backend is pure PHP with no
     * GD/Imagick dependency, unlike simplesoftwareio/simple-qrcode's default
     * PNG output (that package even hard-requires ext-gd at the composer
     * level, which this environment doesn't have).
     */
    public function generateSvg(string $data, int $size = 300): string
    {
        $renderer = new ImageRenderer(
            new RendererStyle($size),
            new SvgImageBackEnd()
        );

        return (new Writer($renderer))->writeString($data);
    }
}
