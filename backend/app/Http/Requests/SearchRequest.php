<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'q' => ['nullable', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'type' => ['nullable', 'in:gym,trainer,shop,all'],
            'lat' => ['nullable', 'numeric', 'between:-90,90', 'required_with:lng'],
            'lng' => ['nullable', 'numeric', 'between:-180,180', 'required_with:lat'],
            'radius_km' => ['nullable', 'numeric', 'min:0.1', 'max:200'],
            'sw_lat' => ['nullable', 'numeric', 'between:-90,90', 'required_with:sw_lng,ne_lat,ne_lng'],
            'sw_lng' => ['nullable', 'numeric', 'between:-180,180', 'required_with:sw_lat,ne_lat,ne_lng'],
            'ne_lat' => ['nullable', 'numeric', 'between:-90,90', 'required_with:sw_lat,sw_lng,ne_lng'],
            'ne_lng' => ['nullable', 'numeric', 'between:-180,180', 'required_with:sw_lat,sw_lng,ne_lat'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:50'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
