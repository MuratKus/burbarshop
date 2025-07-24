# MCP Component Development Rule

## 🎯 **Core Principle:**
Always use MCP tools for component creation instead of manual coding when available.

## 📋 **Process:**

### 1. **Check for Screenshots**
- Look in `.claude/screenshots/` for design references
- Read and analyze the provided design requirements
- Understand the user's visual intent

### 2. **Use MCP Tools First**
- **shadcn-ui MCP**: For getting official shadcn/ui components
- **Component Generation MCP**: For creating custom components from designs
- **Design System MCP**: For consistent styling and patterns

### 3. **MCP Tool Usage Examples**
```bash
# Get component from shadcn-ui MCP
get_component("dialog")
get_component_demo("card")
list_components()

# Get complete blocks
get_block("dashboard-01")
get_block("calendar-01")
```

### 4. **Fallback to Manual Only If:**
- No MCP tool available for the specific component
- MCP tool fails or is unavailable
- Custom modifications needed beyond MCP capabilities

## 🎨 **For Cart Component Redesign:**

### Current Task:
- **Reference**: Check `.claude/screenshots/` for cart design
- **Approach**: Use shadcn-ui MCP to get latest cart/dialog components
- **Implementation**: Combine MCP components with custom styling
- **Enhancement**: Apply Burbar Shop color palette and animations

### MCP Commands to Use:
1. `get_component("dialog")` - For cart overlay
2. `get_component("card")` - For cart item layout
3. `get_component("button")` - For cart actions
4. `get_block("shopping-cart")` - If available
5. `get_component_demo("cart")` - For usage patterns

## 🔄 **Workflow:**
1. Analyze screenshot requirements
2. Use MCP to get base components
3. Customize with site-specific styling
4. Test and refine
5. Document the approach for future reference

## 📸 **Screenshot Analysis:**
When working with screenshots:
- Note layout patterns
- Identify reusable components
- Map to available MCP components
- Plan customization approach

This ensures consistent, high-quality components that follow modern patterns while maintaining our custom design system.