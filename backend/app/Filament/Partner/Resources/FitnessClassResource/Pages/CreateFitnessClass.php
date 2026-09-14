<?php

namespace App\Filament\Partner\Resources\FitnessClassResource\Pages;

use App\Filament\Partner\Resources\FitnessClassResource;
use App\Services\OfferService;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\CreateRecord;

class CreateFitnessClass extends CreateRecord
{
    protected static string $resource = FitnessClassResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $classable = app(OfferService::class)->resolveOwnListing(auth()->user());

        if (! $classable) {
            Notification::make()
                ->title('Create your business profile first')
                ->danger()
                ->send();

            $this->halt();
        }

        $data['classable_type'] = $classable::class;
        $data['classable_id'] = $classable->id;
        $data['is_active'] = $data['is_active'] ?? true;

        return $data;
    }
}
