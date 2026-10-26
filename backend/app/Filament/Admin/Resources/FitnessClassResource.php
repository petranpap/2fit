<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\FitnessClassResource\Pages;
use App\Filament\Concerns\HasClassDayOptions;
use App\Filament\Concerns\HasClassRecurrenceFields;
use App\Models\FitnessClass;
use App\Models\Gym;
use App\Models\Shop;
use App\Models\Trainer;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\TimePicker;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Forms\Get;
use Filament\Resources\Resource;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

/**
 * Admin's platform-wide view over every bookable class (no user_id
 * scoping, unlike Partner's FitnessClassResource) — oversight, plus
 * creating one directly on a partner's behalf.
 */
class FitnessClassResource extends Resource
{
    use HasClassDayOptions;
    use HasClassRecurrenceFields;

    protected static ?string $model = FitnessClass::class;

    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';

    protected static ?string $navigationGroup = 'Listings';

    private const CLASSABLE_TYPE_OPTIONS = [
        Gym::class => 'Gym',
        Trainer::class => 'Trainer',
        Shop::class => 'Shop',
    ];

    public static function form(Form $form): Form
    {
        return $form->schema([
            // Only meaningful at creation — reassigning an existing class to
            // a different listing afterwards isn't a supported edit.
            Select::make('classable_type')
                ->label('Listing type')
                ->options(self::CLASSABLE_TYPE_OPTIONS)
                ->required()
                ->live()
                ->hidden(fn (string $operation): bool => $operation === 'edit'),
            Select::make('classable_id')
                ->label('Listing')
                ->options(fn (Get $get): array => match ($get('classable_type')) {
                    Gym::class => Gym::pluck('name', 'id')->all(),
                    Trainer::class => Trainer::pluck('name', 'id')->all(),
                    Shop::class => Shop::pluck('name', 'id')->all(),
                    default => [],
                })
                ->searchable()
                ->required()
                ->hidden(fn (string $operation): bool => $operation === 'edit'),
            TextInput::make('name')
                ->required()
                ->maxLength(255),
            ...self::recurrenceFields(),
            TimePicker::make('starts_at'),
            TextInput::make('duration_minutes')
                ->numeric()
                ->suffix('min'),
            TextInput::make('capacity')
                ->numeric()
                ->minValue(1)
                ->helperText('Leave blank for unlimited spots. Once full, customers can no longer book this class.'),
            Select::make('categories')
                ->relationship('categories', 'name', fn (Builder $query) => $query->whereNotNull('parent_id'))
                ->multiple()
                ->preload(),
            Toggle::make('is_popular')
                ->label('Show in "Popular Classes"'),
            Toggle::make('is_active')
                ->default(true),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->searchable(),
                TextColumn::make('classable_type')
                    ->label('Listing type')
                    ->formatStateUsing(fn (string $state): string => class_basename($state))
                    ->badge(),
                TextColumn::make('classable.name')->label('Listing'),
                TextColumn::make('schedule')
                    ->label('Schedule')
                    ->state(fn (FitnessClass $record): string => self::formatSchedule($record)),
                TextColumn::make('starts_at')->time(),
                TextColumn::make('booked')
                    ->label('Booked')
                    ->state(fn (FitnessClass $record): string => $record->bookings()->whereIn('status', ['pending', 'confirmed'])->count().' / '.($record->capacity ?? '∞')),
                IconColumn::make('is_popular')->boolean(),
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
            'index' => Pages\ListFitnessClasses::route('/'),
            'create' => Pages\CreateFitnessClass::route('/create'),
            'edit' => Pages\EditFitnessClass::route('/{record}/edit'),
        ];
    }
}
