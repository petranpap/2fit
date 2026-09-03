<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\ShopResource\Pages;
use App\Models\Shop;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\KeyValue;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Table;

class ShopResource extends Resource
{
    protected static ?string $model = Shop::class;

    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';

    protected static ?string $navigationGroup = 'Listings';

    public static function form(Form $form): Form
    {
        return $form->schema([
            TextInput::make('name')->required()->maxLength(255),
            TextInput::make('slug')->required()->maxLength(255)->unique(ignoreRecord: true),
            Textarea::make('description')->maxLength(2000)->columnSpanFull(),
            TextInput::make('address')->maxLength(255),
            TextInput::make('latitude')->numeric(),
            TextInput::make('longitude')->numeric(),
            TextInput::make('phone')->tel()->maxLength(30),
            TextInput::make('email')->email()->maxLength(255),
            TextInput::make('website')->url()->maxLength(255),
            FileUpload::make('logo_path')->label('Logo')->image()->disk('public')->directory('shops/logos'),
            FileUpload::make('cover_image_path')->label('Cover photo')->image()->disk('public')->directory('shops/covers'),
            KeyValue::make('opening_hours')->keyLabel('Day')->valueLabel('Hours'),
            Select::make('categories')->relationship('categories', 'name')->multiple()->preload(),
            Select::make('facilities')->relationship('facilities', 'name')->multiple()->preload(),
            Toggle::make('is_verified')->label('Verified (approved, visible in search)'),
            Toggle::make('is_active')->label('Active'),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('is_verified')
            ->columns([
                TextColumn::make('name')->searchable(),
                TextColumn::make('user.email')->label('Owner')->searchable(),
                TextColumn::make('created_at')->label('Registered')->dateTime('d M Y')->sortable(),
                ToggleColumn::make('is_verified')->label('Verified'),
                ToggleColumn::make('is_active')->label('Active'),
            ])
            ->filters([
                \Filament\Tables\Filters\TernaryFilter::make('is_verified')->label('Verified'),
            ])
            ->actions([
                \Filament\Tables\Actions\EditAction::make(),
                \Filament\Tables\Actions\DeleteAction::make(),
            ]);
    }

    public static function getNavigationBadge(): ?string
    {
        $pending = static::getModel()::where('is_verified', false)->count();

        return $pending > 0 ? (string) $pending : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListShops::route('/'),
            'edit' => Pages\EditShop::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }
}
