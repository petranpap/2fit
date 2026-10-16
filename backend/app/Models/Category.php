<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

#[Fillable(['name', 'slug', 'icon', 'image_url', 'parent_id', 'is_primary'])]
class Category extends Model
{
    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
        ];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function gyms(): MorphToMany
    {
        return $this->morphedByMany(Gym::class, 'categorizable');
    }

    public function trainers(): MorphToMany
    {
        return $this->morphedByMany(Trainer::class, 'categorizable');
    }

    public function shops(): MorphToMany
    {
        return $this->morphedByMany(Shop::class, 'categorizable');
    }

    public function fitnessClasses(): MorphToMany
    {
        return $this->morphedByMany(FitnessClass::class, 'categorizable');
    }
}
