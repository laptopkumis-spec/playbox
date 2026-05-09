<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use App\Http\Resources\UnitResource;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    public function index()
    {
        return UnitResource::collection(Unit::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'        => 'required|string',
            'hourly_rate' => 'required|numeric',
        ]);

        $unit = Unit::create($request->only('name', 'hourly_rate', 'description'));
        $unit->refresh();

        return new UnitResource($unit);
    }

    public function update(Request $request, Unit $unit)
    {
        $unit->update($request->only('name', 'hourly_rate', 'status', 'description'));
        return new UnitResource($unit);
    }

    public function destroy(Unit $unit)
    {
        $unit->delete();
        return response()->json(['message' => 'Unit deleted']);
    }
}
