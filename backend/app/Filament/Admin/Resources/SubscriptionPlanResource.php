<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\SubscriptionPlanResource\Pages;
use App\Models\SubscriptionPlan;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\Str;

/**
 * Reference/config data, same as Categories or Facilities — admin defines
 * which plans exist; a gym/trainer/shop's own subscription_plan_id just
 * points at one of these (assigning a partner to a plan isn't built yet,
 * out of MVP scope — see CLAUDE.md's Membership Management exclusion).
 */
class SubscriptionPlanResource extends Resource
{
    protected static ?string $model = SubscriptionPlan::class;

    protected static ?string $navigationIcon = 'heroicon-o-credit-card';

    protected static ?string $navigationGroup = 'Settings';

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
            TextInput::make('price')
                ->numeric()
                ->required()
                ->prefix('€'),
            Select::make('billing_period')
                ->options([
                    'monthly' => 'Monthly',
                    'yearly' => 'Yearly',
                ])
                ->required(),
            TextInput::make('max_offers')
                ->numeric()
                ->minValue(1)
                ->helperText('Leave blank for unlimited'),
            TagsInput::make('features')
                ->placeholder('Add a feature and press Enter')
                ->columnSpanFull(),
            Toggle::make('is_active')
                ->label('Active (selectable by partners)')
                ->default(true),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->searchable(),
                TextColumn::make('price')->money('EUR'),
                TextColumn::make('billing_period'),
                TextColumn::make('max_offers')->placeholder('Unlimited'),
                TextColumn::make('subscribers')
                    ->label('Subscribers')
                    ->state(fn (SubscriptionPlan $record): int => $record->gyms()->count() + $record->trainers()->count() + $record->shops()->count()),
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
            'index' => Pages\ListSubscriptionPlans::route('/'),
            'create' => Pages\CreateSubscriptionPlan::route('/create'),
            'edit' => Pages\EditSubscriptionPlan::route('/{record}/edit'),
        ];
    }
}
