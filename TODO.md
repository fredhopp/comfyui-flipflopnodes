# TODO - ComfyUI FlipFlop Group Positioner

## 🚨 Critical Issues (Fix Immediately)

### Coordinate Conversion
- [x] **FIXED**: Implement proper coordinate conversion using `canvas.convertEventToCanvasOffset()`
- [x] **FIXED**: Add fallback methods (`canvas.ds.convertOffsetToCanvas()` and manual conversion)
- [x] **FIXED**: Restore working version after logging system broke functionality

### Logging System
- [ ] **Fix circular JSON errors** in debug logging
- [ ] **Implement proper log levels** (ERROR, WARN, INFO, DEBUG)
- [ ] **Add module-specific logging** control
- [ ] **Remove console.log statements** and use proper logging system

### Import/Export Issues
- [ ] **Fix ES6 module imports** that were causing errors
- [ ] **Resolve require() calls** that don't work in ES6 modules
- [ ] **Ensure all modules load correctly** without import errors

## 🔧 High Priority Features

### Error Handling
- [ ] **Add try-catch blocks** around all coordinate conversion methods
- [ ] **Implement graceful degradation** when canvas methods fail
- [ ] **Add user-friendly error messages** for common issues
- [ ] **Create error recovery mechanisms** for failed positioning attempts

### Visual Feedback
- [ ] **Add visual indicator** when shortcut is pressed
- [ ] **Show positioning preview** before moving group
- [ ] **Add success/failure notifications** in ComfyUI interface
- [ ] **Implement loading states** during positioning

### Multiple Groups Support
- [ ] **Allow multiple Group Positioner nodes** in single workflow
- [ ] **Implement group priority system** for overlapping groups
- [ ] **Add group conflict resolution** when multiple groups match
- [ ] **Create group selection UI** for multiple groups

## 📊 Medium Priority Features

### Configuration System
- [ ] **Add configuration import/export** functionality
- [ ] **Implement configuration presets** for common setups
- [ ] **Add configuration validation** with helpful error messages
- [ ] **Create configuration backup/restore** system

### Performance Optimizations
- [ ] **Optimize node detection algorithms** for large workflows
- [ ] **Implement caching** for frequently accessed data
- [ ] **Add lazy loading** for non-critical features
- [ ] **Reduce memory usage** in large workflows

### User Experience
- [ ] **Add keyboard shortcut conflicts detection**
- [ ] **Implement undo/redo functionality** for positioning
- [ ] **Create position history** for recent moves
- [ ] **Add position presets** for common layouts

## 🎨 Low Priority Features

### Advanced Positioning
- [ ] **Add group rotation support**
- [ ] **Implement group scaling** functionality
- [ ] **Add support for nested groups**
- [ ] **Create group templates** system

### UI Enhancements
- [ ] **Create visual group editor**
- [ ] **Add drag-and-drop positioning**
- [ ] **Implement group alignment tools**
- [ ] **Add group distribution tools**

### Integration Features
- [ ] **Add ComfyUI API integration** for external tools
- [ ] **Implement webhook support** for external triggers
- [ ] **Create plugin system** for custom positioning logic
- [ ] **Add automation support** for repetitive tasks

## 🧪 Testing & Quality Assurance

### Unit Tests
- [ ] **Create tests for coordinate conversion** methods
- [ ] **Add tests for node detection** algorithms
- [ ] **Implement tests for configuration** system
- [ ] **Add integration tests** for full workflow

### Manual Testing
- [ ] **Test with different ComfyUI versions**
- [ ] **Verify compatibility with other custom nodes**
- [ ] **Test with various group configurations**
- [ ] **Validate performance with large workflows**

### Documentation
- [ ] **Create API documentation** for developers
- [ ] **Add code comments** for complex functions
- [ ] **Create troubleshooting guide** for common issues
- [ ] **Add video tutorials** for setup and usage

## 🐛 Known Issues to Fix

### Canvas Access Issues
- [ ] **Handle undefined canvas properties** gracefully
- [ ] **Fix canvas property access** edge cases
- [ ] **Add canvas initialization checks**
- [ ] **Implement canvas fallback methods**

### Mouse Position Tracking
- [ ] **Improve mouse position accuracy** across different zoom levels
- [ ] **Fix mouse position tracking** in edge cases
- [ ] **Add mouse position validation**
- [ ] **Implement mouse position smoothing**

### Group Detection
- [ ] **Enhance group detection reliability** for edge cases
- [ ] **Fix group detection** with special characters in names
- [ ] **Add group detection caching**
- [ ] **Implement group detection fallbacks**

## 📈 Future Enhancements

### Advanced Features
- [ ] **Add group animation system** for smooth movements
- [ ] **Implement group physics** for realistic positioning
- [ ] **Create group collaboration** features
- [ ] **Add group versioning** system

### Integration
- [ ] **Add support for external positioning** APIs
- [ ] **Implement cloud-based configuration** sync
- [ ] **Create mobile app** for remote positioning
- [ ] **Add voice control** for positioning

### Analytics
- [ ] **Add usage analytics** (optional, privacy-respecting)
- [ ] **Implement performance monitoring**
- [ ] **Create error reporting** system
- [ ] **Add user feedback** collection

## 🔄 Maintenance Tasks

### Code Quality
- [ ] **Refactor coordinate conversion** code for better maintainability
- [ ] **Standardize error handling** across all modules
- [ ] **Add TypeScript definitions** for better development experience
- [ ] **Implement code linting** and formatting

### Performance Monitoring
- [ ] **Add performance benchmarks** for key operations
- [ ] **Implement memory usage monitoring**
- [ ] **Create performance regression** detection
- [ ] **Add automated performance** testing

### Security
- [ ] **Audit code for security** vulnerabilities
- [ ] **Implement input validation** for all user inputs
- [ ] **Add sanitization** for configuration data
- [ ] **Create security testing** procedures

---

## 📝 Notes

### What We Learned
- **Coordinate conversion** is the most critical part of the extension
- **Crystools' LiteGraph typings** were essential for finding the correct API
- **Multiple fallback methods** are necessary for reliability
- **Simple, working code** is better than complex, broken features

### Key Technical Decisions
- Use `canvas.convertEventToCanvasOffset()` as the primary method
- Implement multiple node detection strategies for reliability
- Keep the codebase modular and maintainable
- Prioritize functionality over features

### Development Guidelines
- Always test coordinate conversion thoroughly
- Keep the core positioning logic simple and reliable
- Add features incrementally without breaking existing functionality
- Document all technical decisions and their rationale

---

*Last updated: December 2024 - Working version restored with proper coordinate conversion*
