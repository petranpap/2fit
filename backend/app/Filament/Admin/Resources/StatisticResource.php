<?php

namespace App\Filament\Admin\Resources;

use App\Filament\Admin\Resources\StatisticResource\Pages;
use App\Models\Statistic;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

/**
 * Raw daily counters behind the dashboard/analytics numbers — see
 * Statistic's docblock. No writer exists yet (nothing in the app
 * increments these outside DemoStatisticSeeder), so this is a
 * view/correct resource for whenever that pipeline lands, not a
 * day-to-day admin task.
 */
class StatisticResource extends Resource
{
    protected static ?string $model = Statistic::class;

    protected static ?string $navigationIcon = 'heroicon-o-chart-bar';

    protected static ?string $navigationGroup = 'Analytics';

    public static function form(Form $form): Form
    {
        return $form->schema([
            Select::make('metric')
                ->options([
                    'profile_view' => 'Profile view',
                    'offer_view' => 'Offer view',
                    'offer_redemption' => 'Offer redemption',
                    'favorite' => 'Favorite',
                ])
                ->required(),
            DatePicker::make('date')->required(),
            TextInput::make('count')->numeric()->minValue(0)->required(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('date', 'desc')
            ->columns([
                TextColumn::make('statable_type')
                    ->label('Listing type')
                    ->formatStateUsing(fn (string $state): string => class_basename($state))
                    ->badge(),
                TextColumn::make('statable.name')->label('Listing'),
                TextColumn::make('metric')->badge(),
                TextColumn::make('date')->date(),
                TextColumn::make('count')->numeric()->sortable(),
            ])
            ->filters([
                SelectFilter::make('metric')->options([
                    'profile_view' => 'Profile view',
                    'offer_view' => 'Offer view',
                    'offer_redemption' => 'Offer redemption',
                    'favorite' => 'Favorite',
                ]),
            ])
            ->actions([
                \Filament\Tables\Actions\EditAction::make(),
                \Filament\Tables\Actions\DeleteAction::make(),
            ]);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->with('statable');
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListStatistics::route('/'),
            'edit' => Pages\EditStatistic::route('/{record}/edit'),
        ];
    }

    public static function canCreate(): bool
    {
        return false;
    }
}
