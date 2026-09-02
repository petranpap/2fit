<?php

namespace App\Filament\Partner\Resources;

use App\Filament\Partner\Resources\OfferResource\Pages;
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
use Filament\Resources\Resource;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class OfferResource extends Resource
{
    protected static ?string $model = Offer::class;

    protected static ?string $navigationIcon = 'heroicon-o-tag';

    protected static ?string $navigationLabel = 'Offers';

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
            Toggle::make('is_active')->default(true),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title')->searchable(),
                TextColumn::make('discount_type'),
                TextColumn::make('discount_value'),
                TextColumn::make('expires_at')->dateTime(),
                IconColumn::make('is_active')->boolean(),
            ])
            ->actions([
                \Filament\Tables\Actions\EditAction::make(),
                \Filament\Tables\Actions\DeleteAction::make(),
            ]);
    }

    /**
     * A partner only ever has one listing (their own gym/trainer/shop) —
     * scope offers to whichever one that is, regardless of type.
     */
    public static function getEloquentQuery(): Builder
    {
        $userId = auth()->id();

        return parent::getEloquentQuery()->whereHasMorph(
            'offerable',
            [Gym::class, Trainer::class, Shop::class],
            fn (Builder $query) => $query->where('user_id', $userId),
        );
    }

    public static function shouldRegisterNavigation(): bool
    {
        return in_array(auth()->user()?->role, ['gym_owner', 'trainer', 'shop'], true);
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
