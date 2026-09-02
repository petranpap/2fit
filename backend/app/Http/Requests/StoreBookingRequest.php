<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
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
            'bookable_type' => ['required', 'in:gym,trainer,shop'],
            'bookable_id' => ['required', 'integer'],
            // Booking a specific class doesn't need a time — it's already
            // scheduled. A generic "Book Now" (no class) does.
            'fitness_class_id' => ['nullable', 'integer', 'exists:fitness_classes,id'],
            'scheduled_at' => ['required_without:fitness_class_id', 'nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
