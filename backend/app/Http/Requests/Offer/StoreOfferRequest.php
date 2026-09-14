<?php

namespace App\Http\Requests\Offer;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class StoreOfferRequest extends FormRequest
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
            'offerable_type' => ['required', 'in:gym,trainer,shop'],
            'offerable_id' => ['required', 'integer'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'discount_type' => ['required', 'in:percentage,fixed_amount'],
            'discount_value' => ['required', 'numeric', 'min:0.01'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($this->input('discount_type') === 'percentage' && (float) $this->input('discount_value') > 100) {
                $validator->errors()->add('discount_value', 'A percentage discount cannot exceed 100.');
            }
        });
    }
}
