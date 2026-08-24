<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

#[Fillable(['name', 'slug', 'icon'])]
class Category extends Model
{
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
}
