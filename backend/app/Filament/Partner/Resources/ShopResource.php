<?php

namespace App\Filament\Partner\Resources;

use App\Filament\Concerns\HasLocationFields;
use App\Filament\Concerns\HasOpeningHoursFields;
use App\Filament\Partner\Resources\ShopResource\Pages;
use App\Models\Shop;
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

class ShopResource extends Resource
{
    use HasLocationFields;
    use HasOpeningHoursFields;

    protected static ?string $model = Shop::class;

    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';

    public static function getNavigationLabel(): string
    {
        return __('partner.nav.shop');
    }

    public static function getModelLabel(): string
    {
        return __('partner.model.shop');
    }

    public static function getPluralModelLabel(): string
    {
        return __('partner.model.shops');
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            TextInput::make('name')->label(__('partner.fields.name'))
                ->required()
                ->maxLength(255)
                ->live(onBlur: true)
                ->afterStateUpdated(fn (string $state, callable $set) => $set('slug', Str::slug($state))),
            TextInput::make('slug')->label(__('partner.fields.slug'))
                ->required()
                ->maxLength(255)
                ->unique(ignoreRecord: true),
            Textarea::make('description')->label(__('partner.fields.description'))
                ->maxLength(2000)
                ->columnSpanFull(),
            TextInput::make('address')->label(__('partner.fields.address'))->maxLength(255),
            ...self::locationFields(),
            TextInput::make('phone')->label(__('partner.fields.phone'))->tel()->maxLength(30),
            TextInput::make('email')->label(__('partner.fields.email'))->email()->maxLength(255),
            TextInput::make('website')->label(__('partner.fields.website'))->url()->maxLength(255),
            FileUpload::make('logo_path')->label(__('partner.fields.logo_path'))
                ->label(__('partner.fields.logo_path'))
                ->image()
                ->disk('public')
                ->directory('shops/logos'),
            FileUpload::make('cover_image_path')->label(__('partner.fields.cover_image_path'))
                ->label(__('partner.fields.cover_image_path'))
                ->image()
                ->disk('public')
                ->directory('shops/covers'),
            ...self::openingHoursFields(),
            Select::make('categories')->label(__('partner.fields.categories'))
                ->relationship('categories', 'name', fn (Builder $query) => $query->whereNotNull('parent_id'))
                ->multiple()
                ->preload(),
            Select::make('facilities')->label(__('partner.fields.facilities'))
                ->relationship('facilities', 'name')
                ->multiple()
                ->preload(),
            Toggle::make('is_active')->label(__('partner.fields.is_active'))
                ->default(true),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->label(__('partner.fields.name'))->searchable(),
                TextColumn::make('address')->label(__('partner.fields.address'))->limit(40),
                IconColumn::make('is_verified')->label(__('partner.fields.is_verified'))->boolean(),
                IconColumn::make('is_active')->label(__('partner.fields.is_active'))->boolean(),
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
        return auth()->user()?->role === 'shop';
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListShops::route('/'),
            'create' => Pages\CreateShop::route('/create'),
            'edit' => Pages\EditShop::route('/{record}/edit'),
        ];
    }
}
