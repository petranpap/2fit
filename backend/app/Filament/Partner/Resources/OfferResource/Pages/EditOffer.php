<?php

namespace App\Filament\Partner\Resources\OfferResource\Pages;

use App\Filament\Partner\Resources\OfferResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditOffer extends EditRecord
{
    protected static string $resource = OfferResource::class;

    protected function getHeaderActions(): array
    {
        return [DeleteAction::make()];
    }
}
