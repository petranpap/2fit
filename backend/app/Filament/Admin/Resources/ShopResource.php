<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\ShopResource\Pages;
use App\Filament\Concerns\HasLocationFields;
use App\Filament\Concerns\HasOpeningHoursFields;
use App\Models\Shop;
use App\Models\User;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ToggleColumn;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class ShopResource extends Resource
{
    use HasLocationFields;
    use HasOpeningHoursFields;

    protected static ?string $model = Shop::class;

    protected static ?string $navigationIcon = 'heroicon-o-shopping-bag';

    protected static ?string $navigationGroup = 'Listings';

    public static function form(Form $form): Form
    {
        return $form->schema([
            // Only meaningful at creation — reassigning an existing shop to
            // a different owner afterwards isn't a supported edit.
            Select::make('user_id')
                ->label('Owner')
                ->options(fn (): array => User::where('role', 'shop')
                    ->get()
                    ->mapWithKeys(fn (User $user): array => [$user->id => "{$user->name} ({$user->email})"])
                    ->all())
                ->searchable()
                ->required()
                ->helperText('Only users with the "Shop" role are listed — create one first under Users if needed.')
                ->hidden(fn (string $operation): bool => $operation === 'edit'),
            TextInput::make('name')
                ->required()
                ->maxLength(255)
                ->live(onBlur: true)
                ->afterStateUpdated(fn (string $state, callable $set) => $set('slug', Str::slug($state))),
            TextInput::make('slug')->required()->maxLength(255)->unique(ignoreRecord: true),
            Textarea::make('description')->maxLength(2000)->columnSpanFull(),
            TextInput::make('address')->maxLength(255),
            ...self::locationFields(),
            TextInput::make('phone')->tel()->maxLength(30),
            TextInput::make('email')->email()->maxLength(255),
            TextInput::make('website')->url()->maxLength(255),
            FileUpload::make('logo_path')->label('Logo')->image()->disk('public')->directory('shops/logos'),
            FileUpload::make('cover_image_path')->label('Cover photo')->image()->disk('public')->directory('shops/covers'),
            ...self::openingHoursFields(),
            Select::make('categories')->relationship('categories', 'name')->multiple()->preload(),
            Select::make('facilities')->relationship('facilities', 'name')->multiple()->preload(),
            Toggle::make('is_verified')->label('Verified (approved, visible in search)')->default(true),
            Toggle::make('is_active')->label('Active')->default(true),
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
            'create' => Pages\CreateShop::route('/create'),
            'edit' => Pages\EditShop::route('/{record}/edit'),
        ];
    }
}
