import React, { useState, useLayoutEffect, useRef, useCallback, useEffect } from 'react';

import { PositionAnimated, Box, Flex, Margins, MarginsWrapper } from '../Box';
import { Icon } from '../Icon';
import { InputBox } from '../InputBox';
import { Options, useCursor } from '../Options';

const Container = Box.extend('rcx-select', 'div');

export const Addon = Box.extend('rcx-select__addon', 'div');

const InnerWrapper = Box.extend('rcx-select__wrapper', 'div');

const Wrapper = ({ children, ...props }) => <InnerWrapper children={React.Children.map(children, (c, i) => <Margins key={i} inline={4}>{c}</Margins>)} {...props} />;

export const Focus = React.forwardRef((props, ref) => <Box ref={ref} className='rcx-select__focus' is='button' {...props}/>);

export const Select = ({
  value,
  filter,
  options = [],
  anchor: Anchor = Focus,
  onChange = () => {},
  getValue = ([value] = []) => value,
  getLabel = ([, label] = []) => label,
  placeholder,
  renderOptions: _Options = Options,
}) => {
  const [internalValue, setInternalValue] = useState(value);


  const currentValue = value !== undefined ? value : internalValue;
  const option = options.find((option) => getValue(option) === currentValue);
  const index = options.indexOf(option);


  const internalChanged = (value) => {
    setInternalValue(value[0]);
  };

  const mapOptions = ([value, label]) => {
    if (currentValue === value) {
      return [value, label, true];
    }
    return [value, label];
  };

  const applyFilter = ([, option]) => !filter || ~option.toLowerCase().indexOf(filter.toLowerCase());
  const filteredOptions = options.filter(applyFilter).map(mapOptions);
  const [cursor, handleKeyDown, handleKeyUp, reset, [visible, hide, show]] = useCursor(index, options, internalChanged);

  const ref = useRef();

  const containerRef = useRef();

  useLayoutEffect(() => {
    hide();
    ref.current.focus();
    onChange(internalValue);
  }, [internalValue]);

  useEffect(reset, [filter]);

  return (
    <Container ref={containerRef} onClick={() => ref.current.focus() & show()}>
      <Flex.Item>
        <Flex.Container>
          <MarginsWrapper inline={4}>
            <Wrapper>
              {(filter === undefined || !visible) && <Box is='span' textStyle='p1' textColor='info' className='rcx-select__placeholder'>{getLabel(option) || placeholder}</Box>}
              <Wrapper mod-hidden={!visible}>
                <Anchor mod-undecorated={true} filter={filter} ref={ref} aria-haspopup='listbox' onClick={show} onBlur={hide} onKeyUp={handleKeyUp} onKeyDown={handleKeyDown} />
              </Wrapper>
              <Addon children={<Icon name={ visible ? 'cross' : 'arrow-down'} size='20' />}/>
            </Wrapper>
          </MarginsWrapper>
        </Flex.Container>
      </Flex.Item>
      <PositionAnimated visible={visible} anchor={containerRef}><_Options role='listbox' filter={filter} options={filteredOptions} onSelect={internalChanged} cursor={cursor} /></PositionAnimated>
    </Container>);
};

export const SelectFiltered = ({
  ...props
}) => {
  const [filter, setFilter] = useState('');
  const anchor = useCallback(React.forwardRef(({ children, placeholder, filter, ...props }, ref) => <InputBox.Input ref={ref} placeholder={placeholder} value={filter} onInput={(e) => setFilter(e.currentTarget.value)} {...props} />), []);

  return <Select {...props} anchor={anchor} filter={filter} />;
};
