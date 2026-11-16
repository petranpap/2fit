<?php

namespace App\Filament\Partner\Resources;

use App\Filament\Concerns\HasClassDayOptions;
use App\Filament\Concerns\HasClassRecurrenceFields;
use App\Filament\Partner\Resources\FitnessClassResource\Pages;
use App\Models\FitnessClass;
use App\Models\Gym;
use App\Models\Shop;
use App\Models\Trainer;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\TimePicker;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class FitnessClassResource extends Resource
{
    use HasClassDayOptions;
    use HasClassRecurrenceFields;

    protected static ?string $model = FitnessClass::class;

    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';

    public static function getNavigationLabel(): string
    {
        return __('partner.nav.classes');
    }

    public static function getModelLabel(): string
    {
        return __('partner.model.class');
    }

    public static function getPluralModelLabel(): string
    {
        return __('partner.model.classes');
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            TextInput::make('name')->label(__('partner.fields.name'))
                ->required()
                ->maxLength(255),
            ...self::recurrenceFields(),
            TimePicker::make('starts_at')->label(__('partner.fields.starts_at')),
            TextInput::make('duration_minutes')->label(__('partner.fields.duration_minutes'))
                ->numeric()
                ->suffix('min'),
            TextInput::make('capacity')->label(__('partner.fields.capacity'))
                ->numeric()
                ->minValue(1)
                ->helperText(__('partner.help.capacity')),
            Select::make('categories')->label(__('partner.fields.categories'))
                ->relationship('categories', 'name', fn (Builder $query) => $query->whereNotNull('parent_id'))
                ->multiple()
                ->preload(),
            Toggle::make('is_popular')->label(__('partner.fields.is_popular'))
                ->label(__('partner.fields.is_popular'))
                ->helperText(__('partner.help.popular')),
            Toggle::make('is_active')->label(__('partner.fields.is_active'))
                ->default(true),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->label(__('partner.fields.name'))->searchable(),
                TextColumn::make('schedule')->label(__('partner.fields.schedule'))
                    ->label(__('partner.fields.schedule'))
                    ->state(fn (FitnessClass $record): string => self::formatSchedule($record)),
                TextColumn::make('starts_at')->label(__('partner.fields.starts_at'))->time(),
                TextColumn::make('booked')->label(__('partner.fields.booked'))
                    ->label(__('partner.fields.booked'))
                    ->state(fn (FitnessClass $record): string => $record->bookings()->whereIn('status', ['pending', 'confirmed'])->count().' / '.($record->capacity ?? '∞')),
                IconColumn::make('is_popular')->label(__('partner.fields.is_popular'))->boolean(),
                IconColumn::make('is_active')->label(__('partner.fields.is_active'))->boolean(),
            ])
            ->actions([
                \Filament\Tables\Actions\EditAction::make(),
                \Filament\Tables\Actions\DeleteAction::make(),
            ]);
    }

    /**
     * A partner only ever has one listing (their own gym/trainer/shop) —
     * scope classes to whichever one that is, regardless of type.
     */
    public static function getEloquentQuery(): Builder
    {
        $userId = auth()->id();

        return parent::getEloquentQuery()->whereHasMorph(
            'classable',
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
            'index' => Pages\ListFitnessClasses::route('/'),
            'create' => Pages\CreateFitnessClass::route('/create'),
            'edit' => Pages\EditFitnessClass::route('/{record}/edit'),
        ];
    }
}
