<?php

namespace App\Filament\Partner\Resources\OfferResource\Pages;

use App\Filament\Partner\Resources\OfferResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListOffers extends ListRecords
{
    protected static string $resource = OfferResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
