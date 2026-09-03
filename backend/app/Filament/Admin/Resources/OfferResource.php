<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\OfferResource\Pages;
use App\Models\Offer;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

/**
 * Admin's platform-wide view over every offer (no user_id scoping, unlike
 * Partner's OfferResource) — oversight/moderation, not day-to-day
 * management, so each row shows whose listing the offer belongs to.
 */
class OfferResource extends Resource
{
    protected static ?string $model = Offer::class;

    protected static ?string $navigationIcon = 'heroicon-o-tag';

    protected static ?string $navigationGroup = 'Commerce';

    public static function form(Form $form): Form
    {
        return $form->schema([
            TextInput::make('title')
                ->required()
                ->maxLength(255),
            Textarea::make('description')
                ->maxLength(2000)
                ->columnSpanFull(),
            Select::make('discount_type')
                ->options([
                    'percentage' => 'Percentage',
                    'fixed_amount' => 'Fixed amount',
                ])
                ->required()
                ->live(),
            TextInput::make('discount_value')
                ->numeric()
                ->required()
                ->suffix(fn (callable $get) => $get('discount_type') === 'percentage' ? '%' : '€')
                ->maxValue(fn (callable $get) => $get('discount_type') === 'percentage' ? 100 : null),
            DateTimePicker::make('starts_at'),
            DateTimePicker::make('expires_at')->after('starts_at'),
            Toggle::make('is_active'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                TextColumn::make('title')->searchable(),
                TextColumn::make('offerable_type')
                    ->label('Listing type')
                    ->formatStateUsing(fn (string $state): string => class_basename($state))
                    ->badge(),
                TextColumn::make('offerable.name')->label('Listing'),
                TextColumn::make('discount_type'),
                TextColumn::make('discount_value'),
                TextColumn::make('expires_at')->dateTime()->placeholder('—'),
                IconColumn::make('is_active')->boolean(),
            ])
            ->actions([
                \Filament\Tables\Actions\EditAction::make(),
                \Filament\Tables\Actions\DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOffers::route('/'),
            'edit' => Pages\EditOffer::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool
    {
        // Offers belong to a specific partner's listing — admin moderates
        // existing ones (edit/deactivate/delete), doesn't author new ones.
        return false;
    }
}
