<?php

namespace App\Filament\Partner\Resources\OfferResource\Pages;

use App\Filament\Partner\Resources\OfferResource;
use App\Services\OfferService;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\CreateRecord;

class CreateOffer extends CreateRecord
{
    protected static string $resource = OfferResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $offerable = app(OfferService::class)->resolveOwnOfferable(auth()->user());

        if (! $offerable) {
            Notification::make()
                ->title('Create your business profile first')
                ->danger()
                ->send();

            $this->halt();
        }

        $data['offerable_type'] = $offerable::class;
        $data['offerable_id'] = $offerable->id;
        $data['is_active'] = $data['is_active'] ?? true;

        return $data;
    }
}
