"use strict";

//  Main TODOs:
//      - Add team names hardcoded for teamName
//          - Add team names to some kind of config file in code
//          - Add gui for adding names to the teamNames config file
//      - Strip everything down to just what we need
//      - Figure out how to have each dice use a different color / material
//          - Have a way to assign dice to each person, whether through a color or texture of some kind
//      - Add in way to manually select names like you would select Dice on homepage
//      - figure out how the mouse tracking / dice selection works and get rid of it
//      - Remake UI to something a little different after we get rid of mouse tracking stuff
//          - Update Results UI
//      - Connect to Database of some kind to track data about rolls
/*
bind_throw
    ->start_throw
        ->throw_dices ---> This is where we figure out mats I think using notations
            ->roll
                ->prepare_dices_for_roll
                    ->create_dice_test
                        ->Test_create_d20
                            ->create_dice_materials_test ---> use the mats value to determine what material to give a specific dice
*/

function dice_initialize(container) {
    $t.remove($t.id('loading_text'));
    var canvas = $t.id('canvas');
    canvas.style.width = window.innerWidth - 1 + 'px';
    canvas.style.height = window.innerHeight - 1 + 'px';
    var label = $t.id('label');
    var set = $t.id('set');
    //var team = $t.id('team');
    var selector_div = $t.id('selector_div');
    var info_div = $t.id('info_div');
    //on_set_change();
    $t.dice.use_true_random = false;
/*
    function on_set_change(ev) { set.style.width = set.value.length + 3 + 'ex'; }
    $t.bind(set, 'keyup', on_set_change);
    $t.bind(set, 'mousedown', function(ev) { ev.stopPropagation(); });
    $t.bind(set, 'mouseup', function(ev) { ev.stopPropagation(); });
    $t.bind(set, 'focus', function(ev) { $t.set(container, { class: '' }); });
    $t.bind(set, 'blur', function(ev) { $t.set(container, { class: 'noselect' }); });
*/

    // Clear button uses this
    $t.bind($t.id('clear'), ['mouseup', 'touchend'], function(ev) {
        ev.stopPropagation();
        set.value = '0';
        on_set_change();
    });

    var params = $t.get_url_params();
    console.log(params);

    if (params.chromakey) {
        $t.dice.desk_color = 0x00ff00;
        info_div.style.display = 'none';
        $t.id('control_panel').style.display = 'none';
    }
    if (params.shadows == 0) {
        $t.dice.use_shadows = false;
    }
    switch (params.color) {
        case 'white':
            $t.dice.dice_color = '#808080';
            $t.dice.label_color = '#202020';
            break;
        case 'red':
            $t.dice.dice_color = '#d10e00';
            $t.dice.label_color = '#202020';
            break;
        case 'blue':
            $t.dice.dice_color = '#1883db';
            $t.dice.label_color = '#202020';
            break;
        case 'green':
            $t.dice.dice_color = '#008a17';
            $t.dice.label_color = '#202020';
            break;
        case 'orange':
            $t.dice.dice_color = '#fc7b03';
            $t.dice.label_color = '#202020';
            break;
        case 'purple':
            $t.dice.dice_color = '#7d0099';
            $t.dice.label_color = '#aaaaaa';
            break;
        case 'brown':
            $t.dice.dice_color = '#593304';
            $t.dice.label_color = '#aaaaaa';
            break;
        default:
            break;
    }

    var box = new $t.dice.dice_box(canvas, { w: 500, h: 300 });
    box.animate_selector = false;

    $t.bind(window, 'resize', function() {
        canvas.style.width = window.innerWidth - 1 + 'px';
        canvas.style.height = window.innerHeight - 1 + 'px';
        box.reinit(canvas, { w: 500, h: 300 });
    });

    // This does the post roll selection stuff - probably dice selection too
    // Breaks the normal homepage when it is commented
//---------------------------------------------------------
    function show_selector() {
        info_div.style.display = 'none';
        selector_div.style.display = 'inline-block';
        //box.draw_selector();
    }
//---------------------------------------------------------

    function before_roll(vectors, notation, callback) {
        info_div.style.display = 'none';
        selector_div.style.display = 'none';
        // do here rpc call or whatever to get your own result of throw.
        // then callback with array of your result, example:
        // callback([2, 2, 2, 2]); // for 4d6 where all dice values are 2.
        callback();
    }

    function notation_getter() {
        return $t.dice.parse_notation(set.value);
    }

    // Thing to update
    function after_roll(notation, result) {
        if (params.chromakey || params.noresult) return;
        console.log(notation)
        console.log(result)

        // If the notation object contains the teamMembers array (which is an array of names for whom the dice are being rolled for)
        // then the formatting for the text output is different
        if (notation.teamMembers) {
            let array = notation.teamMembers
            var res = "Roll Results:" + "<br/>"
            for (let index = 0; index < array.length; index++) {
                const element = array[index];
                res += "" + array[index] + " : " + "" + result[index] + "<br/>"
            }
            console.log(res)
            label.innerHTML = res;
            info_div.style.display = 'inline-block';
            return;
        }

        // take result array [3,4,6,1] and makes it '3' + '4' + '6' + '1'
        var res = result.join(' + ');
        if (notation.constant) {
            res += ' (';
            if (notation.constant > 0) res += '+' + notation.constant;
            else res += '-' + Math.abs(notation.constant);
            res += ')';
        }
        if (result.length > 1) res += ' = ' + 
                (result.reduce(function(s, a) { return s + a; }) + notation.constant);
        label.innerHTML = res;
        info_div.style.display = 'inline-block';
    }

    // Commented out because is calls bind_mouse -> which I think is only used for the drag feature
    //box.bind_mouse(container, notation_getter, before_roll, after_roll);
    
    // Without this nothing happens -> seems to be fairly important
    box.bind_throw($t.id('throw'), notation_getter, before_roll, after_roll);

    /*
    $t.bind(container, ['mouseup', 'touchend'], function(ev) {
        ev.stopPropagation();
        if (selector_div.style.display == 'none') {
            if (!box.rolling) show_selector();
            box.rolling = false;
            return;
        }
        var name = box.search_dice_by_mouse(ev);
        if (name != undefined) {
            var notation = $t.dice.parse_notation(set.value);
            notation.set.push(name);
            set.value = $t.dice.stringify_notation(notation);
            on_set_change();
        }
    });
*/
    if (params.notation) {
        set.value = params.notation;
    }
    if (params.roll) {
        // All I know is that this initiates a dice roll but I don't have a clue how - teal.js is a mystery
        $t.raise_event($t.id('throw'), 'mouseup');
    }
    else {
        show_selector();
    }
}
