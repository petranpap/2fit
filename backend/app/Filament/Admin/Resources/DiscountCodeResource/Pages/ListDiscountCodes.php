<?php

namespace App\Filament\Admin\Resources\DiscountCodeResource\Pages;

use App\Filament\Admin\Resources\DiscountCodeResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListDiscountCodes extends ListRecords
{
    protected static string $resource = DiscountCodeResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()];
    }
}
