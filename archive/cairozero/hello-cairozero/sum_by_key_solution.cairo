from starkware.cairo.common.alloc import alloc
from starkware.cairo.common.dict_access import DictAccess
from starkware.cairo.common.squash_dict import squash_dict

struct KeyValue {
    key: felt,
    value: felt,
}

// Builds a DictAccess list for the computation of the cumulative
// sum for each key.
func build_dict(list: KeyValue*, size, dict: DictAccess*) -> (dict: DictAccess*) {
    jmp body if size != 0;
    return (dict=dict);

    body:
    %{
        # Populate ids.dict.prev_value using cumulative_sums.
        ids.dict.prev_value = cumulative_sums.get(ids.list.key, 0)
        # Add list.value to cumulative_sums[list.key].
        cumulative_sums[ids.list.key] = ids.dict.prev_value + ids.list.value
    %}
    // Copy list.key to dict.key.
    assert dict.key = list.key;
    // Verify that dict.new_value = dict.prev_value + list.value.
    assert dict.new_value = dict.prev_value + list.value;
    // Call recursively to build_dict().
    return build_dict(list=list + KeyValue.SIZE, size=size - 1, dict=dict + DictAccess.SIZE);
}

// Verifies that the initial values were 0, and writes the final
// values to result.
func verify_and_output_squashed_dict(
    squashed_dict: DictAccess*, squashed_dict_end: DictAccess*, result: KeyValue*
) -> (result: KeyValue*) {
    tempvar diff = squashed_dict_end - squashed_dict;
    jmp body if diff != 0;
    return (result=result);

    body:
    // Verify prev_value is 0.
    assert squashed_dict.prev_value = 0;
    // Copy key to result.key.
    assert result.key = squashed_dict.key;
    // Copy new_value to result.value.
    assert result.value = squashed_dict.new_value;
    // Call recursively to verify_and_output_squashed_dict.
    return verify_and_output_squashed_dict(
        squashed_dict=squashed_dict + DictAccess.SIZE,
        squashed_dict_end=squashed_dict_end,
        result=result + KeyValue.SIZE,
    );
}

// Given a list of KeyValue, sums the values, grouped by key,
// and returns a list of pairs (key, sum_of_values).
func sum_by_key{range_check_ptr}(list: KeyValue*, size) -> (result: KeyValue*, result_size: felt) {
    alloc_locals;
    %{
        # Initialize cumulative_sums with an empty dictionary.
        # This variable will be used by ``build_dict`` to hold
        # the current sum for each key.
        cumulative_sums = {}
    %}
    // Allocate memory for dict, squashed_dict and res.
    let (local dict: DictAccess*) = alloc();
    let (local squashed_dict: DictAccess*) = alloc();
    let (local result: KeyValue*) = alloc();

    // Call build_dict().
    let (dict_end) = build_dict(list=list, size=size, dict=dict);
    // Call squash_dict().
    let (local squashed_dict_end) = squash_dict(
        dict_accesses=dict, dict_accesses_end=dict_end, squashed_dict=squashed_dict
    );
    local range_check_ptr = range_check_ptr;
    // Call verify_and_output_squashed_dict().
    verify_and_output_squashed_dict(
        squashed_dict=squashed_dict, squashed_dict_end=squashed_dict_end, result=result
    );
    return (result=result, result_size=(squashed_dict_end - squashed_dict) / DictAccess.SIZE);
}
