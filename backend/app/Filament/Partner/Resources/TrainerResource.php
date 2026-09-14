<?php

namespace App\Filament\Partner\Resources;

use App\Filament\Partner\Resources\TrainerResource\Pages;
use App\Models\Trainer;
use Filament\Forms\Components\FileUpload;
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

class TrainerResource extends Resource
{
    protected static ?string $model = Trainer::class;

    protected static ?string $navigationIcon = 'heroicon-o-user';

    protected static ?string $navigationLabel = 'My Trainer Profile';

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
            Textarea::make('bio')
                ->maxLength(2000)
                ->columnSpanFull(),
            TextInput::make('address')->maxLength(255),
            TextInput::make('latitude')->numeric(),
            TextInput::make('longitude')->numeric(),
            TextInput::make('phone')->tel()->maxLength(30),
            TextInput::make('email')->email()->maxLength(255),
            TextInput::make('hourly_rate')
                ->numeric()
                ->prefix('€'),
            FileUpload::make('photo_path')
                ->label('Photo')
                ->image()
                ->disk('public')
                ->directory('trainers/photos'),
            Select::make('categories')
                ->relationship('categories', 'name')
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
                TextColumn::make('hourly_rate')->money('EUR'),
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
        return auth()->user()?->role === 'trainer';
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTrainers::route('/'),
            'create' => Pages\CreateTrainer::route('/create'),
            'edit' => Pages\EditTrainer::route('/{record}/edit'),
        ];
    }
}
