<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;

#[Fillable(['statable_id', 'statable_type', 'metric', 'date', 'count'])]
class Statistic extends Model
{
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'count' => 'integer',
        ];
    }

    public function statable(): MorphTo
    {
        return $this->morphTo();
    }
}
