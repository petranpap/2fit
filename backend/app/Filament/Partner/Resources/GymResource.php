<?php

namespace App\Filament\Partner\Resources;

use App\Filament\Partner\Resources\GymResource\Pages;
use App\Models\Gym;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\KeyValue;
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
use Illuminate\Support\Str;

class GymResource extends Resource
{
    protected static ?string $model = Gym::class;

    protected static ?string $navigationIcon = 'heroicon-o-building-storefront';

    protected static ?string $navigationLabel = 'My Gym';

    public static function form(Form $form): Form
    {
        return $form->schema([
            TextInput::make('name')
                ->required()
                ->maxLength(255)
                ->live(onBlur: true)
                ->afterStateUpdated(fn (string $state, callable $set) => $set('slug', Str::slug($state))),
            TextInput::make('slug')
                ->required()
                ->maxLength(255)
                ->unique(ignoreRecord: true),
            Textarea::make('description')
                ->maxLength(2000)
                ->columnSpanFull(),
            TextInput::make('address')->maxLength(255),
            TextInput::make('latitude')->numeric(),
            TextInput::make('longitude')->numeric(),
            TextInput::make('phone')->tel()->maxLength(30),
            TextInput::make('email')->email()->maxLength(255),
            TextInput::make('website')->url()->maxLength(255),
            FileUpload::make('logo_path')
                ->label('Logo')
                ->image()
                ->disk('public')
                ->directory('gyms/logos'),
            FileUpload::make('cover_image_path')
                ->label('Cover photo')
                ->image()
                ->disk('public')
                ->directory('gyms/covers'),
            KeyValue::make('opening_hours')
                ->keyLabel('Day')
                ->valueLabel('Hours')
                ->helperText('e.g. monday -> 09:00-21:00'),
            Select::make('categories')
                ->relationship('categories', 'name')
                ->multiple()
                ->preload(),
            Select::make('facilities')
                ->relationship('facilities', 'name')
                ->multiple()
                ->preload(),
            Toggle::make('is_active')
                ->default(true),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->searchable(),
                TextColumn::make('address')->limit(40),
                IconColumn::make('is_verified')->boolean(),
                IconColumn::make('is_active')->boolean(),
            ])
            ->actions([
                \Filament\Tables\Actions\EditAction::make(),
            ]);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->where('user_id', auth()->id());
    }

    public static function shouldRegisterNavigation(): bool
    {
        return auth()->user()?->role === 'gym_owner';
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListGyms::route('/'),
            'create' => Pages\CreateGym::route('/create'),
            'edit' => Pages\EditGym::route('/{record}/edit'),
        ];
    }
}
