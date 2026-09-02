<?php

namespace App\Filament\Partner\Resources\ShopResource\Pages;

use App\Filament\Partner\Resources\ShopResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListShops extends ListRecords
{
    protected static string $resource = ShopResource::class;

    protected function getHeaderActions(): array
    {
        return ShopResource::getEloquentQuery()->exists() ? [] : [CreateAction::make()];
    }
}
