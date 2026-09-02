<?php

namespace App\Http\Requests\Offer;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateOfferRequest extends FormRequest
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
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'discount_type' => ['sometimes', 'required', 'in:percentage,fixed_amount'],
            'discount_value' => ['sometimes', 'required', 'numeric', 'min:0.01'],
            'starts_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            $type = $this->input('discount_type', $this->route('offer')?->discount_type);

            if ($type === 'percentage' && $this->filled('discount_value') && (float) $this->input('discount_value') > 100) {
                $validator->errors()->add('discount_value', 'A percentage discount cannot exceed 100.');
            }
        });
    }
}
