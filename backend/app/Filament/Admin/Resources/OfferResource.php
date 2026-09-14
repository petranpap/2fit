<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\OfferResource\Pages;
use App\Models\Gym;
use App\Models\Offer;
use App\Models\Shop;
use App\Models\Trainer;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Resources\Resource;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

/**
 * Admin's platform-wide view over every offer (no user_id scoping, unlike
 * Partner's OfferResource) — oversight/moderation, plus creating one
 * directly on a partner's behalf (e.g. support request), so each row shows
 * whose listing the offer belongs to.
 */
class OfferResource extends Resource
{
    protected static ?string $model = Offer::class;

    protected static ?string $navigationIcon = 'heroicon-o-tag';

    protected static ?string $navigationGroup = 'Commerce';

    private const LISTING_TYPE_OPTIONS = [
        Gym::class => 'Gym',
        Trainer::class => 'Trainer',
        Shop::class => 'Shop',
    ];

    public static function form(Form $form): Form
    {
        return $form->schema([
            // Only meaningful at creation — reassigning an existing offer to
            // a different listing afterwards isn't a supported edit.
            Select::make('offerable_type')
                ->label('Listing type')
                ->options(self::LISTING_TYPE_OPTIONS)
                ->required()
                ->live()
                ->hidden(fn (string $operation): bool => $operation === 'edit'),
            Select::make('offerable_id')
                ->label('Listing')
                ->options(fn (Get $get): array => match ($get('offerable_type')) {
                    Gym::class => Gym::pluck('name', 'id')->all(),
                    Trainer::class => Trainer::pluck('name', 'id')->all(),
                    Shop::class => Shop::pluck('name', 'id')->all(),
                    default => [],
                })
                ->searchable()
                ->required()
                ->hidden(fn (string $operation): bool => $operation === 'edit'),
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
            Toggle::make('is_active')->default(true),
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
            'create' => Pages\CreateOffer::route('/create'),
            'edit' => Pages\EditOffer::route('/{record}/edit'),
        ];
    }
}
