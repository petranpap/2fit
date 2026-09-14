<?php

namespace App\Filament\Partner\Resources;

use App\Filament\Partner\Resources\FitnessClassResource\Pages;
use App\Models\FitnessClass;
use App\Models\Gym;
use App\Models\Shop;
use App\Models\Trainer;
use Filament\Forms\Components\CheckboxList;
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
    protected static ?string $model = FitnessClass::class;

    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';

    protected static ?string $navigationLabel = 'Classes';

    public const DAY_OPTIONS = [
        'monday' => 'Monday',
        'tuesday' => 'Tuesday',
        'wednesday' => 'Wednesday',
        'thursday' => 'Thursday',
        'friday' => 'Friday',
        'saturday' => 'Saturday',
        'sunday' => 'Sunday',
    ];

    public static function form(Form $form): Form
    {
        return $form->schema([
            TextInput::make('name')
                ->required()
                ->maxLength(255),
            CheckboxList::make('days_of_week')
                ->label('Available days')
                ->options(self::DAY_OPTIONS)
                ->columns(4)
                ->helperText('Pick every day this class runs — e.g. Monday/Wednesday/Friday for a 3x-a-week class.'),
            TimePicker::make('starts_at'),
            TextInput::make('duration_minutes')
                ->numeric()
                ->suffix('min'),
            TextInput::make('capacity')
                ->numeric(),
            Toggle::make('is_popular')
                ->label('Show in "Popular Classes"')
                ->helperText('Highlighted first on your public profile.'),
            Toggle::make('is_active')
                ->default(true),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->searchable(),
                TextColumn::make('days_of_week')
                    ->label('Days')
                    ->state(fn (FitnessClass $record): string => $record->days_of_week
                        ? collect($record->days_of_week)->map(fn (string $day) => self::DAY_OPTIONS[$day])->join(', ')
                        : '—'),
                TextColumn::make('starts_at')->time(),
                IconColumn::make('is_popular')->boolean(),
                IconColumn::make('is_active')->boolean(),
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
