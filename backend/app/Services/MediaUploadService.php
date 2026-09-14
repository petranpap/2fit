<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;

class MediaUploadService
{
    public function store(UploadedFile $file, string $directory): string
    {
        return $file->store($directory, 'public');
    }
}
