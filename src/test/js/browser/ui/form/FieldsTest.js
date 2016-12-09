asynctest(
  'Fields Ui',
 
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.ui.FormInput',
    'ephox.alloy.api.ui.FormSelect',
    'ephox.alloy.test.GuiSetup',
    'ephox.peanut.Fun'
  ],
 
  function (Assertions, Step, GuiFactory, Representing, FormInput, FormSelect, GuiSetup, Fun) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var labelSpec = {
      dom: {
        tag: 'label',
        innerHtml: 'Label'
      },
      components: [ ]
    };

    GuiSetup.setup(function (store, doc, body) {

      var inputA = FormInput.build({
        uid: 'input-a',
        dom: {
          tag: 'div'
        },
        components: [
          FormInput.parts().field(),
          FormInput.parts().label()
        ],
        parts: {
          field: {
            data: {
              value: 'init',
              text: 'Init'
            }
          },
          label: labelSpec
        }
      });

      var selectB = FormSelect.build({
        uid: 'select-b',
        dom: {
          tag: 'div'
        },
        components: [
          FormSelect.parts().label(),
          FormSelect.parts().field()
        ],
        parts: {
          field: {
            options: [
              { value: 'select-b-init', text: 'Select-b-init' }
            ],
            members: {
              option: {
                munge: Fun.identity
              }
            }
          },
          label: labelSpec
        }
      });

      return GuiFactory.build(
        {
          uiType: 'container',
          components: [
            inputA,
            selectB
          ]
        }
      );

    }, function (doc, body, gui, component, store) {

      var inputA = component.getSystem().getByUid('input-a').getOrDie();
      var selectB = component.getSystem().getByUid('select-b').getOrDie();

      return [
        Step.sync(function () {
          var val = Representing.getValue(inputA);
          Assertions.assertEq('Checking input-a value', 'init', val.value);
          Assertions.assertEq('Checking input-a text', 'Init', val.text);
        }),

        Step.sync(function () {
          var val = Representing.getValue(selectB);
          Assertions.assertEq('Checking select-b value', 'select-b-init', val.value);
          Assertions.assertEq('Checking select-b text', 'Select-b-init', val.text);
        }),


        Step.fail('done')
      ];
    }, function () { success(); }, failure);

  }
);