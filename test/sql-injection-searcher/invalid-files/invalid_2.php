$someVariable = Input::get("some_variable");

$results = DB::select( DB::raw("SELECT * FROM some_table WHERE some_col = '$someVariable'") );

$someOtherVariable = Input::get("some_other_variable");

$results = DB::select( DB::raw("SELECT * FROM some_table WHERE some_other_col = $some_other_variable") );
